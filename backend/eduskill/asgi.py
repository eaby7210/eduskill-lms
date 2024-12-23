import os
import sys
import logging
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from core.consumers import NotificationConsumer
from students.consumers import ChatConsumer, CourseChatConsumer
from core.middleware import JWTAuthMiddleware

# Configure logging to output to stderr
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr)
    ]
)
logger = logging.getLogger(__name__)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduskill.settings')

# Initialize Django
django.setup()

# Initialize Django ASGI application
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
