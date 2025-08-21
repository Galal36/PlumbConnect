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

def create_test_complaints():
    print("=== Creating Test Complaints for Admin ===")
    
    # Get users
    users = User.objects.all()
    if users.count() < 2:
        print("❌ Need at least 2 users to create complaints")
        return
    
    plumbers = users.filter(role='plumber')
    regular_users = users.filter(role='user')
    
    if plumbers.count() == 0:
        print("❌ No plumbers found")
        return
    
    if regular_users.count() == 0:
        print("❌ No regular users found")
        return
    
    # Create test complaints
    test_complaints = [
        {
            'from_user': regular_users.first(),
            'to_user': plumbers.first(),
            'complaint_type': 'poor_service_quality',
            'description': 'السباك لم يقم بإصلاح المشكلة بشكل صحيح وتسرب الماء مرة أخرى بعد يوم واحد.',
            'status': 'pending'
        },
        {
            'from_user': regular_users.last() if regular_users.count() > 1 else regular_users.first(),
            'to_user': plumbers.last() if plumbers.count() > 1 else plumbers.first(),
            'complaint_type': 'inappropriate_behavior',
            'description': 'السباك كان غير مهذب ولم يحترم مواعيد الحضور المتفق عليها.',
            'status': 'in_progress'
        },
        {
            'from_user': plumbers.first(),
            'to_user': regular_users.first(),
            'complaint_type': 'payment_issues',
            'description': 'العميل رفض دفع المبلغ المتفق عليه بعد إنجاز العمل.',
            'status': 'resolved'
        }
    ]
    
    created_count = 0
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
            created_count += 1
        else:
            print(f"⚠️ Complaint already exists: {complaint_data['complaint_type']}")
    
    print(f"\n📊 Total complaints in database: {Complaint.objects.count()}")
    print(f"📊 New complaints created: {created_count}")
    
    # Show all complaints
    print("\n=== All Complaints ===")
    for complaint in Complaint.objects.all():
        print(f"ID: {complaint.id} | From: {complaint.from_user.name} | To: {complaint.to_user.name} | Type: {complaint.complaint_type} | Status: {complaint.status}")

if __name__ == "__main__":
    create_test_complaints()
