import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        print(f"WebSocket connection attempt by user: {user}")  # للتشخيص

        if user.is_authenticated:
            self.user_group_name = f"user_{user.id}"
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )
            await self.accept()

            # إرسال رسالة ترحيب
            await self.send_json({
                'type': 'connection_established',
                'message': f'مرحباً {user.name}! تم الاتصال بنجاح.',
                'user_id': user.id
            })
            print(f"User {user.id} connected successfully")
        else:
            print("Unauthenticated user tried to connect")
            await self.close()

    async def disconnect(self, close_code):
        user = self.scope["user"]
        if user.is_authenticated and hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
            print(f"User {user.id} disconnected")

    async def receive_json(self, content):
        """استقبال رسائل من العميل"""
        message_type = content.get('type', 'unknown')

        if message_type == 'ping':
            await self.send_json({
                'type': 'pong',
                'message': 'Connection is alive'
            })
        elif message_type == 'test':
            await self.send_json({
                'type': 'test_response',
                'message': f'تم استلام رسالتك: {content.get("message", "")}'
            })

    async def notification_message(self, event):
        """إرسال إشعار للعميل"""
        await self.send_json({
            'type': 'notification',
            'notification': event["message"]
        })
