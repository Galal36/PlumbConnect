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
        # تحليل الرسالة وإعطاء رد مناسب
        message_lower = message.lower()

        # ردود ذكية بناءً على محتوى الرسالة

        # تركيب الحنفية/الصنبور
        if any(word in message_lower for word in ['ركب', 'تركيب', 'جنفية', 'حنفية', 'صنبور']) and any(word in message_lower for word in ['ازاي', 'كيف', 'طريقة']):
            response = """خطوات تركيب الحنفية (الصنبور):

🔧 **الأدوات المطلوبة:**
- مفاتيح ربط مختلفة الأحجام
- شريط تيفلون (Teflon tape)
- جوانات مطاطية جديدة
- مادة عازلة للخيوط

📋 **خطوات التركيب:**
1. **أغلق المياه:** أغلق صمام المياه الرئيسي
2. **إزالة القديم:** فك الحنفية القديمة بحذر
3. **تنظيف المكان:** نظف مكان التركيب من الأوساخ
4. **لف الخيوط:** استخدم شريط التيفلون على الخيوط
5. **التركيب:** ركب الحنفية الجديدة واربطها بإحكام
6. **التوصيل:** وصل أنابيب المياه الساخنة والباردة
7. **الاختبار:** افتح المياه واختبر عدم وجود تسريب

⚠️ **تحذير:** إذا لم تكن متأكداً، استعن بسباك محترف لتجنب الأضرار."""

        # التوصيلات الأساسية للسباكة
        elif any(word in message_lower for word in ['توصيل', 'توصيلات', 'اساسية', 'أساسية', 'شرح']) and any(word in message_lower for word in ['سباكة', 'حمام', 'مطبخ']):
            response = """التوصيلات الأساسية للسباكة:

🏠 **في الحمام:**
1. **خط المياه الباردة:** من الخزان الرئيسي
2. **خط المياه الساخنة:** من السخان
3. **صرف الحوض:** يتصل بالمجاري الرئيسية
4. **صرف الحمام:** أنبوب منفصل للمجاري
5. **صرف المرحاض:** اتصال مباشر بالمجاري

🔧 **المكونات الرئيسية:**
- **الصمامات:** للتحكم في تدفق المياه
- **الأنابيب:** PVC أو نحاس للتوصيل
- **الجوانات:** لمنع التسريب
- **السيفون:** لمنع رجوع الروائح

🚨 **للحالات العاجلة:**
- أغلق الصمام الرئيسي فوراً
- تواصل مع سباك محترف عبر موقعنا
- لا تحاول إصلاحات معقدة بنفسك

هل تحتاج تفاصيل أكثر عن جزء معين؟"""

        # تسريب المياه
        elif any(word in message_lower for word in ['تسريب', 'تسرب', 'ماء', 'مياه']) and not any(word in message_lower for word in ['ركب', 'تركيب']):
            response = """لإصلاح تسريب الماء:

🔍 **تحديد مصدر التسريب:**
- من الصنبور/الحنفية
- من الأنابيب
- من المرحاض
- من الحوض

🔧 **للتسريب من الصنبور:**
1. أغلق مصدر المياه الرئيسي
2. فك الصنبور بحذر
3. افحص الجوانات (الحلقات المطاطية)
4. استبدل الجوانات التالفة
5. أعد تركيب الصنبور

🚰 **للتسريب من الأنابيب:**
1. أغلق المياه فوراً
2. حدد مكان التسريب بدقة
3. استخدم شريط إصلاح مؤقت
4. اتصل بسباك محترف

⚠️ **تحذير:** للتسريبات الكبيرة، اتصل بسباك فوراً عبر موقعنا لتجنب الأضرار."""

        # انسداد المجاري
        elif any(word in message_lower for word in ['انسداد', 'مسدود', 'مجاري', 'بالوعة']):
            response = """لحل مشكلة انسداد المجاري:

🚿 **للانسداد البسيط:**
1. استخدم المكبس (البلنجر)
2. جرب الماء الساخن مع الصابون
3. استخدم خليط الخل وبيكربونات الصوديوم
4. جرب سلك التنظيف للانسداد السطحي

🔧 **للانسداد الشديد:**
- تحتاج لسباك محترف مع معدات خاصة
- لا تستخدم المواد الكيميائية القوية
- قد تحتاج لماكينة تسليك المجاري

⚠️ **علامات الانسداد الشديد:**
- رجوع المياه من البالوعة
- روائح كريهة مستمرة
- بطء في تصريف المياه

يمكنك طلب خدمة سباك من خلال موقعنا للحصول على مساعدة فورية."""

        # أدوات السباكة
        elif any(word in message_lower for word in ['أدوات', 'عدة', 'مفاتيح', 'أدوات سباكة', 'مطلوبة', 'احتاج']):
            response = """الأدوات الأساسية للسباكة:

🔧 **أدوات أساسية:**
- مفاتيح ربط مختلفة الأحجام
- مكبس (بلنجر) للانسداد
- شريط تيفلون للخيوط
- مفك براغي متعدد الأحجام
- منشار أنابيب

🛠️ **أدوات متقدمة:**
- ماكينة تسليك المجاري
- جهاز كشف التسريب
- مفاتيح أنابيب خاصة
- جوانات وحلقات مطاطية

💡 **نصيحة:** للمشاكل البسيطة، الأدوات الأساسية كافية. للمشاكل المعقدة، الأفضل الاستعانة بسباك محترف لديه الأدوات المناسبة."""

        # البحث عن سباكين أو طلب خدمة عاجلة
        elif any(word in message_lower for word in ['سباك', 'سباكين', 'بحث', 'أبحث', 'عاجل', 'طوارئ', 'فوري']) and not any(word in message_lower for word in ['أدوات', 'عدة']):
            if any(word in message_lower for word in ['عاجل', 'طوارئ', 'فوري', 'سريع']):
                response = """🚨 **للحالات العاجلة:**

⚡ **خطوات سريعة:**
1. **أغلق المياه فوراً** من الصمام الرئيسي
2. **اتصل بسباك طوارئ** عبر موقعنا
3. **ابحث عن "خدمة طوارئ"** في قائمة السباكين
4. **اختر سباك متاح 24 ساعة**

🔍 **للعثور على سباك طوارئ:**
- اذهب لصفحة "السباكين"
- فلتر البحث: "متاح الآن" أو "طوارئ"
- اختر أقرب سباك لمنطقتك
- اتصل مباشرة أو احجز عبر الموقع

📞 **نصائح مهمة:**
- وضح طبيعة المشكلة بدقة
- اذكر مستوى الإلحاح
- تأكد من توفر السباك فوراً

⚠️ **تذكر:** في حالات الطوارئ، السرعة مهمة لتجنب الأضرار!"""
            else:
                response = """للعثور على أفضل السباكين في الكويت:

🔍 **كيفية البحث:**
1. اذهب لصفحة "السباكين" في الموقع
2. اختر منطقتك (حولي، الأحمدي، الجهراء، إلخ)
3. اطلع على التقييمات والمراجعات
4. قارن الأسعار والخدمات

⭐ **نصائح للاختيار:**
- اختر سباك بتقييم عالي (4+ نجوم)
- اقرأ تعليقات العملاء السابقين
- تأكد من توفر الخدمة في منطقتك
- قارن الأسعار قبل الاختيار
- تحقق من سنوات الخبرة

🏆 **مناطق الخدمة في الكويت:**
- حولي، الأحمدي، الجهراء
- الفروانية، مبارك الكبير
- العاصمة، الفحيحيل"""

        elif any(word in message_lower for word in ['موقع', 'استخدام', 'كيف', 'طريقة']):
            response = """شرح استخدام موقع PlumbingConnect:

📱 **الميزات الرئيسية:**
1. **البحث عن السباكين:** تصفح قائمة السباكين في منطقتك
2. **طلب الخدمة:** احجز موعد مع السباك المناسب
3. **المحادثات:** تواصل مباشرة مع السباكين
4. **التقييمات:** اقرأ واكتب تقييمات للخدمات
5. **المقالات:** اطلع على نصائح ومقالات مفيدة

🎯 **كيفية طلب خدمة:**
1. اختر السباك المناسب
2. انقر على "طلب خدمة"
3. اكتب تفاصيل المشكلة
4. حدد الوقت المناسب
5. انتظر تأكيد السباك"""

        elif any(word in message_lower for word in ['مرحبا', 'السلام', 'أهلا', 'مساء', 'صباح']):
            response = """مرحباً بك في PlumbingConnect! 👋

أنا مساعدك الذكي وأسعد بخدمتك. يمكنني مساعدتك في:

🔧 **خدمات السباكة:**
- حل مشاكل التسريب والانسداد
- نصائح الصيانة الوقائية
- إرشادات الإصلاحات البسيطة

🔍 **استخدام الموقع:**
- البحث عن سباكين محترفين
- طلب الخدمات وحجز المواعيد
- قراءة التقييمات والمراجعات

كيف يمكنني مساعدتك اليوم؟"""

        elif any(word in message_lower for word in ['شكرا', 'شكراً', 'ممتاز', 'رائع']):
            response = """العفو! سعيد لأنني تمكنت من مساعدتك 😊

إذا كان لديك أي أسئلة أخرى حول:
- مشاكل السباكة
- استخدام الموقع
- البحث عن سباكين
- أي شيء آخر

لا تتردد في سؤالي. أنا هنا لمساعدتك دائماً!"""

        # مشاكل المرحاض
        elif any(word in message_lower for word in ['مرحاض', 'تواليت', 'كرسي', 'سيفون']):
            response = """مشاكل المرحاض الشائعة وحلولها:

🚽 **مشاكل الطرد (السيفون):**
- **لا يطرد:** افحص مستوى المياه في الخزان
- **طرد ضعيف:** نظف فتحات الطرد
- **طرد مستمر:** اضبط عوامة الخزان

🔧 **مشاكل التسريب:**
- **من القاعدة:** استبدل الحلقة المطاطية
- **من الخزان:** افحص صمام الطرد
- **صوت مياه مستمر:** اضبط العوامة

⚠️ **تحذيرات مهمة:**
- لا تستخدم مواد كيميائية قوية
- لا تضع أشياء صلبة في المرحاض
- للمشاكل المعقدة، استعن بسباك محترف

هل تحتاج تفاصيل أكثر عن مشكلة معينة؟"""

        # مشاكل السخان
        elif any(word in message_lower for word in ['سخان', 'ماء ساخن', 'مياه ساخنة', 'تسخين']):
            response = """مشاكل السخان وحلولها:

🔥 **مشاكل شائعة:**
- **لا يسخن:** افحص الكهرباء والثرموستات
- **ماء فاتر:** اضبط درجة الحرارة
- **تسريب:** افحص الصمامات والأنابيب
- **صوت غريب:** قد تحتاج تنظيف من الترسبات

🔧 **صيانة وقائية:**
- نظف السخان كل 6 أشهر
- افحص الأنود سنوياً
- اضبط الحرارة على 60 درجة مئوية

⚠️ **تحذير:** مشاكل السخان تحتاج خبرة، استعن بسباك مختص لتجنب المخاطر.

يمكنك العثور على فنيين مختصين في السخانات عبر موقعنا."""



        else:
            # رد عام محسن للأسئلة غير المتوقعة
            response = """أفهم أن لديك سؤال حول السباكة، دعني أساعدك بشكل أفضل:

🔧 **أسئلة السباكة الشائعة:**
- تسريب المياه (صنبور، أنابيب، مرحاض)
- انسداد المجاري والبالوعات
- تركيب وإصلاح الحنفيات
- مشاكل السخان والمياه الساخنة
- التوصيلات الأساسية للحمام والمطبخ

🔍 **خدمات الموقع:**
- البحث عن سباكين محترفين
- طلب خدمة طوارئ
- قراءة التقييمات والمراجعات
- حجز مواعيد الصيانة

💬 **لمساعدة أفضل، أخبرني:**
- ما هي المشكلة بالتحديد؟
- أين مكان المشكلة؟ (حمام، مطبخ، إلخ)
- هل المشكلة عاجلة؟

اكتب سؤالك بوضوح وسأقدم لك الحل المناسب! 😊"""

        return {
            'success': True,
            'response': response,
            'tokens_used': len(message.split()) + len(response.split()),
            'response_time': 0.5,
            'model': 'mock-ai-smart'
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
