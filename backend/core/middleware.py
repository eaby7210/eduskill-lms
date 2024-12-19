from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from urllib.parse import parse_qs


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
        return user
    except (TokenError, User.DoesNotExist):
        return None


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Get query parameters
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        # Get token from query parameters
        token = query_params.get('token', [None])[0]

        if token:
            user = await get_user_from_token(token)

            if user:
                scope['user'] = user
            else:
                scope['user'] = None
        else:
            scope['user'] = None

        return await super().__call__(scope, receive, send)
