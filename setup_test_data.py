#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to the Python path
sys.path.append('/home/abdallah/PyCharmMiscProject/fbackf/PlumbConnect_rem')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PlumbConnect.settings')
django.setup()

from complaints.models import Complaint
from users.models import User
from chats.models import Chat

def setup_test_data():
    print("=== Setting Up Test Data ===")
    
    # Check existing users
    print(f"📊 Total users: {User.objects.count()}")
    for user in User.objects.all():
        print(f"  - {user.name} ({user.email}) - Role: {user.role}")
    
    # Create test users if needed
    test_users = [
        {
            'email': 'customer1@example.com',
            'name': 'أحمد محمد',
            'role': 'user',
            'phone': '12345678',
            'password': 'testpass123'
        },
        {
            'email': 'customer2@example.com', 
            'name': 'فاطمة علي',
            'role': 'user',
            'phone': '87654321',
            'password': 'testpass123'
        },
        {
            'email': 'plumber1@example.com',
            'name': 'محمد السباك',
            'role': 'plumber',
            'phone': '11111111',
            'password': 'testpass123'
        },
        {
            'email': 'admin1@example.com',
            'name': 'مدير النظام',
            'role': 'admin',
            'phone': '99999999',
            'password': 'testpass123'
        }
    ]
    
    created_users = []
    for user_data in test_users:
        existing = User.objects.filter(email=user_data['email']).first()
        if not existing:
            user = User.objects.create_user(**user_data)
            print(f"✅ Created user: {user.name} ({user.role})")
            created_users.append(user)
        else:
            print(f"⚠️ User already exists: {user_data['email']}")
            created_users.append(existing)
    
    # Get users for complaints
    users = User.objects.all()
    plumbers = users.filter(role='plumber')
    regular_users = users.filter(role='user')
    
    print(f"\n📊 Plumbers: {plumbers.count()}")
    print(f"📊 Regular users: {regular_users.count()}")
    
    if plumbers.count() > 0 and regular_users.count() > 0:
        # Create test complaints
        test_complaints = [
            {
                'from_user': regular_users.first(),
                'to_user': plumbers.first(),
                'complaint_type': 'poor_service_quality',
                'description': 'السباك لم يقم بإصلاح المشكلة بشكل صحيح وتسرب الماء مرة أخرى بعد يوم واحد. العمل كان غير مكتمل والسباك غادر دون التأكد من حل المشكلة.',
                'status': 'pending'
            },
            {
                'from_user': regular_users.last() if regular_users.count() > 1 else regular_users.first(),
                'to_user': plumbers.first(),
                'complaint_type': 'inappropriate_behavior',
                'description': 'السباك كان غير مهذب ولم يحترم مواعيد الحضور المتفق عليها. وصل متأخراً ساعتين دون إعلام مسبق.',
                'status': 'in_progress'
            },
            {
                'from_user': plumbers.first(),
                'to_user': regular_users.first(),
                'complaint_type': 'payment_issues',
                'description': 'العميل رفض دفع المبلغ المتفق عليه بعد إنجاز العمل بحجة أن العمل لم يكن كما متوقع.',
                'status': 'resolved',
                'admin_notes': 'تم التحقق من العمل وكان مطابقاً للمواصفات المتفق عليها.'
            },
            {
                'from_user': regular_users.first(),
                'to_user': plumbers.first(),
                'complaint_type': 'fraud_scam',
                'description': 'السباك طلب دفع مبلغ إضافي غير متفق عليه مسبقاً وهدد بعدم إكمال العمل.',
                'status': 'pending'
            },
            {
                'from_user': regular_users.last() if regular_users.count() > 1 else regular_users.first(),
                'to_user': plumbers.first(),
                'complaint_type': 'spam_harassment',
                'description': 'السباك يرسل رسائل مزعجة ومكالمات في أوقات غير مناسبة حتى بعد انتهاء العمل.',
                'status': 'in_progress'
            }
        ]
        
        created_complaints = 0
        for complaint_data in test_complaints:
            # Check if complaint already exists
            existing = Complaint.objects.filter(
                from_user=complaint_data['from_user'],
                to_user=complaint_data['to_user'],
                complaint_type=complaint_data['complaint_type']
            ).first()
            
            if not existing:
                complaint = Complaint.objects.create(**complaint_data)
                print(f"✅ Created complaint #{complaint.id}: {complaint.complaint_type}")
                created_complaints += 1
            else:
                print(f"⚠️ Complaint already exists: {complaint_data['complaint_type']}")
        
        print(f"\n📊 Total complaints in database: {Complaint.objects.count()}")
        print(f"📊 New complaints created: {created_complaints}")
        
        # Show all complaints
        print("\n=== All Complaints ===")
        for complaint in Complaint.objects.all():
            print(f"ID: {complaint.id} | From: {complaint.from_user.name} ({complaint.from_user.role}) | To: {complaint.to_user.name} ({complaint.to_user.role}) | Type: {complaint.complaint_type} | Status: {complaint.status}")
    
    else:
        print("❌ Cannot create complaints - missing plumbers or regular users")

if __name__ == "__main__":
    setup_test_data()
