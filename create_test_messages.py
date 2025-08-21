#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to the Python path
sys.path.append('/home/abdallah/PyCharmMiscProject/fbackf/PlumbConnect_rem')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PlumbConnect.settings')
django.setup()

from chats.models import Chat
from chat_messages.models import Message
from users.models import User

def create_test_messages():
    print("=== Creating Test Messages ===")
    
    # Get existing chats
    chats = Chat.objects.all()
    print(f"📊 Total chats: {chats.count()}")
    
    if chats.count() == 0:
        print("❌ No chats found. Creating test chats first...")
        
        # Get users
        users = User.objects.all()
        plumbers = users.filter(role='plumber')
        clients = users.filter(role__in=['client', 'user'])
        
        if plumbers.count() > 0 and clients.count() > 0:
            # Create test chats
            chat1 = Chat.objects.create(
                sender=clients.first(),
                receiver=plumbers.first()
            )
            print(f"✅ Created chat #{chat1.id}: {chat1.sender.name} → {chat1.receiver.name}")
            
            if clients.count() > 1:
                chat2 = Chat.objects.create(
                    sender=clients.last(),
                    receiver=plumbers.first()
                )
                print(f"✅ Created chat #{chat2.id}: {chat2.sender.name} → {chat2.receiver.name}")
            
            chats = Chat.objects.all()
    
    # Create test messages for each chat
    for chat in chats:
        # Check if messages already exist
        existing_messages = Message.objects.filter(chat=chat).count()
        if existing_messages > 0:
            print(f"⚠️ Chat #{chat.id} already has {existing_messages} messages")
            continue
        
        # Create test messages
        test_messages = [
            {
                'chat': chat,
                'sender': chat.sender,
                'content': f'مرحبا {chat.receiver.name}، أحتاج إلى خدمات السباكة',
                'message_type': 'text'
            },
            {
                'chat': chat,
                'sender': chat.receiver,
                'content': f'أهلاً وسهلاً {chat.sender.name}، ما نوع المشكلة التي تواجهها؟',
                'message_type': 'text'
            },
            {
                'chat': chat,
                'sender': chat.sender,
                'content': 'لدي تسريب في المياه في الحمام ويحتاج إلى إصلاح عاجل',
                'message_type': 'text'
            },
            {
                'chat': chat,
                'sender': chat.receiver,
                'content': 'لا مشكلة، يمكنني المساعدة. ما هو عنوانك؟',
                'message_type': 'text'
            },
            {
                'chat': chat,
                'sender': chat.sender,
                'content': 'العنوان: حولي، شارع تونس، بناية 15',
                'message_type': 'text'
            },
            {
                'chat': chat,
                'sender': chat.receiver,
                'content': 'ممتاز، سأكون هناك خلال ساعة. رسوم الكشف 10 دنانير',
                'message_type': 'text'
            },
            {
                'chat': chat,
                'sender': chat.sender,
                'content': 'شكراً لك، في انتظارك',
                'message_type': 'text'
            }
        ]
        
        created_count = 0
        for msg_data in test_messages:
            try:
                message = Message.objects.create(**msg_data)
                created_count += 1
            except Exception as e:
                print(f"❌ Failed to create message: {e}")
        
        print(f"✅ Created {created_count} messages for chat #{chat.id}")
    
    # Show summary
    total_chats = Chat.objects.count()
    total_messages = Message.objects.count()
    
    print(f"\n📊 SUMMARY:")
    print(f"📊 Total chats: {total_chats}")
    print(f"📊 Total messages: {total_messages}")
    
    print(f"\n=== All Chats with Messages ===")
    for chat in Chat.objects.all():
        message_count = Message.objects.filter(chat=chat).count()
        print(f"Chat #{chat.id}: {chat.sender.name} ↔ {chat.receiver.name} ({message_count} messages)")
        
        # Show first few messages
        messages = Message.objects.filter(chat=chat).order_by('created_at')[:3]
        for msg in messages:
            print(f"  - {msg.sender.name}: {msg.content[:50]}...")

if __name__ == "__main__":
    create_test_messages()
