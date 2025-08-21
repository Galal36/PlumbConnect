#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to the Python path
sys.path.append('/home/abdallah/PyCharmMiscProject/fbackf/PlumbConnect_rem')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PlumbConnect.settings')
django.setup()

from chatbot.ai_clients import get_ai_client

def test_chatbot_responses():
    print("=== Testing ChatBot AI Responses ===\n")
    
    # Get the AI client (should be MockAIClient by default)
    ai_client = get_ai_client()
    print(f"Using AI Client: {ai_client.__class__.__name__}\n")
    
    # Test questions - including the problematic ones from the user
    test_questions = [
        "لدي تسريب في المياه",
        "اشرحلي التوصيلات الاسااسية للسباكة",
        "ازاي اركب جنفية",
        "اري توصيل السباكة الاساية في الحمام واريد حلها بشكل عاجل",
        "انسداد في المجاري",
        "أبحث عن سباك في الكويت",
        "مشكلة في المرحاض",
        "السخان لا يعمل",
        "ما هي الأدوات المطلوبة للسباكة؟",
        "مرحبا"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"🔹 السؤال {i}: {question}")
        
        # Generate response
        result = ai_client.generate_response(question)
        
        if result['success']:
            print(f"✅ الإجابة: {result['response']}")
            print(f"📊 المعلومات: Model: {result['model']}, Tokens: {result['tokens_used']}, Time: {result['response_time']}s")
        else:
            print(f"❌ خطأ: {result['error']}")
            print(f"📝 الرد الافتراضي: {result['response']}")
        
        print("-" * 80)
        print()

if __name__ == "__main__":
    test_chatbot_responses()
