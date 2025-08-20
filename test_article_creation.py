#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to the Python path
sys.path.append('/home/abdallah/PyCharmMiscProject/fbackf/PlumbConnect_rem')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PlumbConnect.settings')
django.setup()

from articles.models import Article
from users.models import User
from articles.ai_reviewer import review_article_with_ai

def test_article_creation():
    print("=== Testing Article Creation ===")
    
    # Get a plumber user
    try:
        plumber = User.objects.filter(role='plumber').first()
        if not plumber:
            print("❌ No plumber user found. Creating one...")
            plumber = User.objects.create_user(
                email='test_plumber@example.com',
                name='Test Plumber',
                role='plumber',
                phone='1234567890',
                password='testpass123'
            )
            print("✅ Test plumber created")
        else:
            print(f"✅ Using existing plumber: {plumber.name}")
    except Exception as e:
        print(f"❌ Error getting/creating plumber: {e}")
        return

    # Test AI review function first
    print("\n=== Testing AI Review Function ===")
    test_content = "This is a test article about plumbing techniques and water pipe installation."
    ai_result = review_article_with_ai(test_content)
    
    if ai_result:
        print("✅ AI review function works!")
        print(f"AI Result: {ai_result}")
    else:
        print("❌ AI review function failed")
        print("Continuing with article creation without AI review...")

    # Create article
    print("\n=== Creating Article ===")
    try:
        article = Article.objects.create(
            title="Test Article - Plumbing Tips",
            description="This is a comprehensive guide about modern plumbing techniques, including pipe installation, leak detection, and maintenance best practices.",
            user=plumber,
            is_approved=False
        )
        
        print(f"✅ Article created successfully! ID: {article.id}")
        print(f"   Title: {article.title}")
        print(f"   Author: {article.user.name}")
        print(f"   Approved: {article.is_approved}")
        print(f"   AI Score: {article.ai_review_score}")
        print(f"   AI Summary: {article.ai_review_summary}")
        print(f"   AI Concerns: {article.ai_review_concerns}")
        
        return article
        
    except Exception as e:
        print(f"❌ Error creating article: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    test_article_creation()
