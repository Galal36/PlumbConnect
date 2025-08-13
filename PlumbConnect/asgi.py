import os
import django
from django.core.asgi import get_asgi_application

# تعيين إعدادات Django أولاً
os.enviro
# Password validationn.setdefault('DJANGO_SETTINGS_MODULE', 'PlumbConnect.settings')

# تهيئة Django
django.setup()

# الآن يمكن استيراد باقي المكونات
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import notifications.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                notifications.routing.websocket_urlpatterns
            )
        )
    ),
})
