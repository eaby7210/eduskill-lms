from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
import logging
import json

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user_from_token(token):
    from rest_framework_simplejwt.exceptions import TokenError
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth import get_user_model
        User = get_user_model()
        # Use the AccessToken class from simplejwt
        access_token = AccessToken(token)
        user = User.objects.get(id=access_token['user_id'])
        logger.info(f"Successfully authenticated user: {user.username}")
        return user
    except (TokenError, User.DoesNotExist) as e:
        logger.error(f"Token authentication failed: {e}")
        return None


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Log the incoming WebSocket connection details
        logger.info("WebSocket connection attempt")
        logger.info(f"Connection Scope Keys: {list(scope.keys())}")
        
        # Log detailed scope information for debugging
        try:
            # Safely convert scope to a JSON-serializable format
            scope_debug = {
                'type': scope.get('type'),
                'path': scope.get('path'),
                'headers': [list(map(bytes.decode, header)) for header in scope.get('headers', [])],
                'query_string': scope.get('query_string', b'').decode('utf-8', errors='ignore')
            }
            logger.debug(f"Detailed Scope Information: {json.dumps(scope_debug, indent=2)}")
        except Exception as e:
            logger.error(f"Error logging scope details: {e}")

        # Get query parameters
        query_string = scope.get('query_string', b'').decode('utf-8', errors='ignore')
        query_params = parse_qs(query_string)
        
        # Log query parameters for debugging
        logger.info(f"WebSocket query parameters: {query_params}")

        # Get token from query parameters
        token = query_params.get('token', [None])[0]

        if token:
            logger.info("Token found in query parameters")
            user = await get_user_from_token(token)

            if user:
                scope['user'] = user
                logger.info(f"User {user.username} authenticated for WebSocket")
            else:
                scope['user'] = None
                logger.warning("WebSocket authentication failed: Invalid token")
        else:
            scope['user'] = None
            logger.warning("WebSocket connection attempt without token")

        return await super().__call__(scope, receive, send)
