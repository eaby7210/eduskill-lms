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

logger.info("Initializing ASGI application with WebSocket routes")

# Print out the routes for verification
logger.info("WebSocket Routes:")
logger.info("1. /ws/notification/")
logger.info("2. /ws/chat/<room_id>/")
logger.info("3. /ws/course_chat/<course_slug>/")

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

logger.info("ASGI application routes configured successfully")
