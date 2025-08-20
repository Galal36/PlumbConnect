import requests
import time
from django.conf import settings
from typing import Dict, Any, Optional


class AIClientBase:
    def __init__(self):
        self.max_tokens = getattr(settings, 'AI_MAX_TOKENS', 1000)
        self.temperature = getattr(settings, 'AI_TEMPERATURE', 0.7)

    def generate_response(self, message: str, conversation_history: list = None) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement generate_response method")


class GrokClient(AIClientBase):
    def __init__(self):
        super().__init__()
        self.api_key = getattr(settings, 'XAI_API_KEY', '')
        self.base_url = "https://api.x.ai/v1"

    def generate_response(self, message: str, conversation_history: list = None) -> Dict[str, Any]:
        if not self.api_key:
            return {
                'success': False,
                'error': 'Grok API key not configured',
                'response': 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً.'
            }

        # إعداد الرسائل مع السياق العربي والكويتي
        messages = [
            {
                "role": "system",
                "content": """أنت مساعد ذكي لموقع PlumbingConnect - منصة تربط العملاء بالسباكين المحترفين في الكويت.

مهامك:
1. مساعدة العملاء في العثور على سباكين مناسبين
2. الإجابة على أسئلة حول خدمات السباكة
3. شرح كيفية استخدام الموقع
4. تقديم نصائح عامة حول مشاكل السباكة البسيطة
5. توجيه المستخدمين للميزات المناسبة في الموقع

قواعد مهمة:
- أجب باللغة العربية دائماً
- استخدم المصطلحات الكويتية عند الحاجة
- كن مفيداً ومهذباً
- لا تقدم نصائح طبية أو قانونية
- وجه المستخدمين لطلب مساعدة مهنية للمشاكل المعقدة
- اذكر ميزات الموقع عند الحاجة (البحث عن سباكين، المحادثات، التقييمات)"""
            }
        ]

        # إضافة تاريخ المحادثة
        if conversation_history:
            for msg in conversation_history[-10:]:  # آخر 10 رسائل فقط
                role = "user" if msg.message_type == "user" else "assistant"
                messages.append({"role": role, "content": msg.content})

        # إضافة الرسالة الحالية
        messages.append({"role": "user", "content": message})

        start_time = time.time()

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "grok-beta",
                    "messages": messages,
                    "max_tokens": self.max_tokens,
                    "temperature": self.temperature
                },
                timeout=30
            )

            response_time = time.time() - start_time

            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'response': data['choices'][0]['message']['content'],
                    'tokens_used': data.get('usage', {}).get('total_tokens', 0),
                    'response_time': response_time,
                    'model': 'grok-beta'
                }
            else:
                return {
                    'success': False,
                    'error': f'Grok API error: {response.status_code}',
                    'response': 'عذراً، حدث خطأ في الخدمة. يرجى المحاولة مرة أخرى.',
                    'response_time': response_time
                }

        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Request timeout',
                'response': 'عذراً، استغرق الرد وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى.',
                'response_time': time.time() - start_time
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
                'response_time': time.time() - start_time
            }


class DeepSeekClient(AIClientBase):
    def __init__(self):
        super().__init__()
        self.api_key = getattr(settings, 'DEEPSEEK_API_KEY', '')
        self.base_url = "https://api.deepseek.com/v1"

    def generate_response(self, message: str, conversation_history: list = None) -> Dict[str, Any]:
        if not self.api_key:
            return {
                'success': False,
                'error': 'DeepSeek API key not configured',
                'response': 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً.'
            }

        # نفس المنطق مثل Grok لكن مع DeepSeek API
        messages = [
            {
                "role": "system",
                "content": """أنت مساعد ذكي لموقع PlumbingConnect - منصة تربط العملاء بالسباكين المحترفين في الكويت.

مهامك:
1. مساعدة العملاء في العثور على سباكين مناسبين
2. الإجابة على أسئلة حول خدمات السباكة
3. شرح كيفية استخدام الموقع
4. تقديم نصائح عامة حول مشاكل السباكة البسيطة
5. توجيه المستخدمين للميزات المناسبة في الموقع

قواعد مهمة:
- أجب باللغة العربية دائماً
- استخدم المصطلحات الكويتية عند الحاجة
- كن مفيداً ومهذباً
- لا تقدم نصائح طبية أو قانونية
- وجه المستخدمين لطلب مساعدة مهنية للمشاكل المعقدة
- اذكر ميزات الموقع عند الحاجة (البحث عن سباكين، المحادثات، التقييمات)"""
            }
        ]

        if conversation_history:
            for msg in conversation_history[-10:]:
                role = "user" if msg.message_type == "user" else "assistant"
                messages.append({"role": role, "content": msg.content})

        messages.append({"role": "user", "content": message})

        start_time = time.time()

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": messages,
                    "max_tokens": self.max_tokens,
                    "temperature": self.temperature
                },
                timeout=30
            )

            response_time = time.time() - start_time

            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'response': data['choices'][0]['message']['content'],
                    'tokens_used': data.get('usage', {}).get('total_tokens', 0),
                    'response_time': response_time,
                    'model': 'deepseek-chat'
                }
            else:
                return {
                    'success': False,
                    'error': f'DeepSeek API error: {response.status_code}',
                    'response': 'عذراً، حدث خطأ في الخدمة. يرجى المحاولة مرة أخرى.',
                    'response_time': response_time
                }

        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Request timeout',
                'response': 'عذراً، استغرق الرد وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى.',
                'response_time': time.time() - start_time
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
                'response_time': time.time() - start_time
            }


# Mock client للاختبار بدون API keys
class MockAIClient(AIClientBase):
    def generate_response(self, message: str, conversation_history: list = None) -> Dict[str, Any]:
        # ردود تجريبية للاختبار مع السياق الكويتي
        mock_responses = [
            "مرحباً! أنا مساعدك الذكي في PlumbingConnect. كيف يمكنني مساعدتك اليوم؟",
            "يمكنني مساعدتك في العثور على أفضل السباكين في منطقتك. ما هي المشكلة التي تواجهها؟",
            "لحل مشكلة انسداد الأنابيب، أنصحك بالتواصل مع سباك محترف من خلال موقعنا.",
            "يمكنك تصفح قائمة السباكين المتاحين وقراءة التقييمات لاختيار الأنسب لك.",
            "هل تحتاج مساعدة في استخدام ميزات الموقع؟ يمكنني شرح كيفية البحث والتواصل مع السباكين.",
            "في الكويت، مشاكل السباكة شائعة خاصة في الصيف. ما نوع المشكلة التي تواجهها؟",
            "يمكنك البحث عن سباكين في منطقتك مثل حولي، الأحمدي، أو الجهراء من خلال الموقع."
        ]

        import random
        response = random.choice(mock_responses)

        return {
            'success': True,
            'response': response,
            'tokens_used': len(message.split()) + len(response.split()),
            'response_time': 0.5,
            'model': 'mock-ai'
        }


def get_ai_client(model_name: str = None) -> AIClientBase:
    """Factory function to get the appropriate AI client"""
    if not model_name:
        model_name = getattr(settings, 'AI_DEFAULT_MODEL', 'mock')

    if model_name.lower() == 'grok':
        return GrokClient()
    elif model_name.lower() == 'deepseek':
        return DeepSeekClient()
    elif model_name.lower() == 'mock':
        return MockAIClient()
    else:
        # Default to Mock for testing
        return MockAIClient()
