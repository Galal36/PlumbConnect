# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings
from .models import Chat
from chat_messages.models import Message
from chat_messages.serializers import MessageSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Authenticate user from token
        user = await self.authenticate_user()
        if not user:
            await self.close()
            return

        self.scope["user"] = user
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.chat_group_name = f'chat_{self.chat_id}'

        # Verify user has access to this chat
        has_access = await self.check_chat_access()
        if not has_access:
            await self.close()
            return

        await self.channel_layer.group_add(self.chat_group_name, self.channel_name)
        await self.set_user_online()
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'chat_group_name'):
            await self.channel_layer.group_discard(self.chat_group_name, self.channel_name)
        if hasattr(self, 'scope') and 'user' in self.scope:
            await self.set_user_offline()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = await self.save_message(data)

            # Serialize the message
            message_data = await self.serialize_message(message)

            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    'type': 'chat_message',
                    'message': message_data
                }
            )
        except Exception as e:
            print(f"Error in receive: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Failed to process message'
            }))

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

    @database_sync_to_async
    def authenticate_user(self):
        """Authenticate user from token in query parameters"""
        try:
            # Get token from query parameters
            query_string = self.scope.get('query_string', b'').decode()
            query_params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
            token = query_params.get('token')

            if not token:
                print("No token provided in WebSocket connection")
                return None

            # Decode and validate the token
            try:
                UntypedToken(token)
                decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = decoded_data.get('user_id')

                if user_id:
                    user = User.objects.get(id=user_id)
                    return user

            except (InvalidToken, TokenError, User.DoesNotExist) as e:
                print(f"Token validation failed: {e}")
                return None

        except Exception as e:
            print(f"Authentication error: {e}")
            return None

    @database_sync_to_async
    def check_chat_access(self):
        try:
            chat = Chat.objects.get(id=self.chat_id)
            user = self.scope['user']
            return user in [chat.sender, chat.receiver]
        except Chat.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, data):
        try:
            chat = Chat.objects.get(id=self.chat_id)
            user = self.scope['user']

            # Verify user has access to this chat
            if user not in [chat.sender, chat.receiver]:
                return None

            message = Message.objects.create(
                chat=chat,
                sender=user,
                content=data.get('content', ''),
                message_type=data.get('message_type', 'text')
            )
            return message
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def serialize_message(self, message):
        try:
            serializer = MessageSerializer(message)
            return serializer.data
        except Exception as e:
            print(f"Error serializing message: {e}")
            return None

    @database_sync_to_async
    def set_user_online(self):
        try:
            user = self.scope['user']
            user.set_online()
        except Exception as e:
            print(f"Error setting user online: {e}")

    @database_sync_to_async
    def set_user_offline(self):
        try:
            user = self.scope.get('user')
            if user and hasattr(user, 'set_offline') and not user.is_anonymous:
                user.set_offline()
        except Exception as e:
            print(f"Error setting user offline: {e}")