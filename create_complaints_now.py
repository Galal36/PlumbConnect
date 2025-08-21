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

def create_complaints_now():
    print("=== Creating Complaints with Existing Users ===")
    
    # Get existing users
    users = User.objects.all()
    plumbers = users.filter(role='plumber')
    clients = users.filter(role__in=['client', 'user'])  # Both client and user roles
    
    print(f"📊 Total users: {users.count()}")
    print(f"📊 Plumbers: {plumbers.count()}")
    print(f"📊 Clients: {clients.count()}")
    
    if plumbers.count() == 0 or clients.count() == 0:
        print("❌ Need both plumbers and clients to create complaints")
        return
    
    # Delete existing complaints to start fresh
    existing_count = Complaint.objects.count()
    if existing_count > 0:
        Complaint.objects.all().delete()
        print(f"🗑️ Deleted {existing_count} existing complaints")
    
    # Create test complaints
    test_complaints = [
        {
            'from_user': clients.first(),
            'to_user': plumbers.first(),
            'complaint_type': 'poor_service_quality',
            'description': 'السباك لم يقم بإصلاح المشكلة بشكل صحيح وتسرب الماء مرة أخرى بعد يوم واحد. العمل كان غير مكتمل والسباك غادر دون التأكد من حل المشكلة.',
            'status': 'pending'
        },
        {
            'from_user': clients.last() if clients.count() > 1 else clients.first(),
            'to_user': plumbers.first(),
            'complaint_type': 'inappropriate_behavior',
            'description': 'السباك كان غير مهذب ولم يحترم مواعيد الحضور المتفق عليها. وصل متأخراً ساعتين دون إعلام مسبق ولم يعتذر.',
            'status': 'in_progress'
        },
        {
            'from_user': plumbers.first(),
            'to_user': clients.first(),
            'complaint_type': 'payment_issues',
            'description': 'العميل رفض دفع المبلغ المتفق عليه بعد إنجاز العمل بحجة أن العمل لم يكن كما متوقع رغم أن العمل تم وفقاً للمواصفات.',
            'status': 'resolved',
            'admin_notes': 'تم التحقق من العمل وكان مطابقاً للمواصفات المتفق عليها. تم حل النزاع.'
        },
        {
            'from_user': clients.first(),
            'to_user': plumbers.last() if plumbers.count() > 1 else plumbers.first(),
            'complaint_type': 'fraud_scam',
            'description': 'السباك طلب دفع مبلغ إضافي غير متفق عليه مسبقاً وهدد بعدم إكمال العمل إذا لم يتم الدفع.',
            'status': 'pending'
        },
        {
            'from_user': clients.last() if clients.count() > 1 else clients.first(),
            'to_user': plumbers.first(),
            'complaint_type': 'spam_harassment',
            'description': 'السباك يرسل رسائل مزعجة ومكالمات في أوقات غير مناسبة حتى بعد انتهاء العمل ويطلب أعمال إضافية.',
            'status': 'in_progress'
        },
        {
            'from_user': clients.first(),
            'to_user': plumbers.first(),
            'complaint_type': 'other',
            'description': 'السباك ترك أدواته في المنزل ولم يعد لأخذها رغم المحاولات المتكررة للتواصل معه.',
            'status': 'pending'
        }
    ]
    
    created_complaints = 0
    for complaint_data in test_complaints:
        try:
            complaint = Complaint.objects.create(**complaint_data)
            print(f"✅ Created complaint #{complaint.id}: {complaint.complaint_type} - {complaint.status}")
            created_complaints += 1
        except Exception as e:
            print(f"❌ Failed to create complaint: {e}")
    
    print(f"\n📊 Total complaints created: {created_complaints}")
    print(f"📊 Total complaints in database: {Complaint.objects.count()}")
    
    # Show all complaints
    print("\n=== All Complaints for Admin ===")
    for complaint in Complaint.objects.all().order_by('-created_at'):
        print(f"ID: {complaint.id}")
        print(f"  From: {complaint.from_user.name} ({complaint.from_user.role})")
        print(f"  To: {complaint.to_user.name} ({complaint.to_user.role})")
        print(f"  Type: {complaint.get_complaint_type_display()}")
        print(f"  Status: {complaint.get_status_display()}")
        print(f"  Description: {complaint.description[:100]}...")
        print(f"  Created: {complaint.created_at}")
        print("  ---")

if __name__ == "__main__":
    create_complaints_now()
