"""
ASGI config for PlumbConnect project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PlumbConnect.settings')

django_asgi_app = get_asgi_application()

websocket_urlpatterns = []

try:
    import notifications.routing
    websocket_urlpatterns.extend(notifications.routing.websocket_urlpatterns)
except ImportError:
    pass

try:
    import chats.routing
    websocket_urlpatterns.extend(chats.routing.websocket_urlpatterns)
except ImportError:
    pass

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
