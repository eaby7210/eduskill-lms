import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from core.consumers import NotificationConsumer
from students.consumers import ChatConsumer, CourseChatConsumer
from core.middleware import JWTAuthMiddleware


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduskill.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter([
            path("ws/notification/", NotificationConsumer.as_asgi()),
            path("ws/chat/<str:room_id>/", ChatConsumer.as_asgi()),
            path('ws/course_chat/<str:course_slug>/',
                 CourseChatConsumer.as_asgi()),
        ])
    ),
})
