import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # الحصول على user_id من المسار
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'notifications_{self.user_id}'

        # التحقق من المستخدم
        user = await self.get_user()
        if not user or user.is_anonymous:
            await self.close()
            return

        # إضافة المستخدم إلى المجموعة
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # إزالة المستخدم من المجموعة
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notification_message(self, event):
        # إرسال الإشعار للعميل
        notification = event['message']
        await self.send(text_data=json.dumps({
            'type': 'notification_message',
            'notification': {
                'id': notification['id'],
                'title': notification['title'],
                'content': notification['content'],
                'notification_type': notification['notification_type'],
                'is_read': notification['is_read'],
                'is_important': notification['is_important'],
                'action_url': notification.get('action_url'),
                'created_at': notification['created_at'],
                'read_at': notification.get('read_at'),
            }
        }))

    @database_sync_to_async
    def get_user(self):
        try:
            return User.objects.get(id=self.user_id)
        except User.DoesNotExist:
            return None