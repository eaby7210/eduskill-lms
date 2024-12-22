from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import traceback
import logging

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_groups(user_id):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        groups = ['user']  # Base group for all users

        if user.is_superuser:
            groups.append('admin')
        elif hasattr(user, 'student'):
            groups.append('student')
        elif hasattr(user, 'teacher'):
            groups.append('tutor')

        return groups
    except User.DoesNotExist:
        return []


class NotificationConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        try:
            logger.info(f"Notification WebSocket connection attempt. URL Route: {self.scope['url_route']}")
            
            # Check if user is authenticated
            if not self.scope.get('user'):
                logger.warning("Unauthenticated Notification WebSocket connection attempt")
                await self.close()
                return

            # Get user's groups
            self.user_groups = await get_user_groups(self.scope['user'].id)
            logger.info(f"User groups: {self.user_groups}")

            # Join user-specific group
            self.user_group = f"notification_{self.scope['user'].id}"
            await self.channel_layer.group_add(self.user_group, self.channel_name)
            logger.info(f"Added to user group: {self.user_group}")

            # Join role-based groups
            for group in self.user_groups:
                group_name = f"notification_{group}"
                await self.channel_layer.group_add(group_name, self.channel_name)
                logger.info(f"Added to role group: {group_name}")

            await self.accept()
            logger.info(f"Notification WebSocket connection established for user: {self.scope['user'].id}")
        except Exception as e:
            logger.error(f"Error in Notification WebSocket connection: {e}")
            logger.error(traceback.format_exc())
            await self.close()

    async def disconnect(self, code):
        # Leave user-specific group
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(
                self.user_group, self.channel_name
            )

        # Leave role-based groups
        if hasattr(self, 'user_groups'):
            for group in self.user_groups:
                group_name = f"role_{group}"
                await self.channel_layer.group_discard(
                    group_name, self.channel_name
                )

    async def receive_json(self, content):
        """
        Handle incoming JSON messages from the WebSocket.
        """
        action = content.get("action", None)
        logger.info(f"Received JSON action: {action}")
        
        if action == "ping":
            await self.send_json({"message": "pong"})
        elif action == "close":
            await self.send_json({"message": "Closing"}, close=True)
        else:
            await self.send_json({"error": "Unknown action"})

    async def sendnotification(self, event):
        """
        Send notification to WebSocket based on user role and target.
        """
        try:
            logger.info(f"Processing notification event: {event}")
            
            should_send = False
            target_role = event.get('user_role')
            target_user = str(event.get('receiver'))

            # Check if this is a role-specific notification
            if target_role:
                role_group = f"role_{target_role.lower()}"
                logger.debug(f"Checking role group: {role_group}")
                logger.debug(f"User groups: {self.user_groups}")
                if role_group in [f"role_{group}" for group in self.user_groups]:
                    should_send = True
                    logger.debug(f"Matched role group: {role_group}")

            # Check if this is a user-specific notification
            if target_user and str(self.scope['user'].id) == target_user:
                should_send = True
                logger.debug(f"Matched user-specific notification for user {target_user}")

            # Admins receive all notifications
            if 'admin' in self.user_groups:
                should_send = True
                logger.debug("Admin user, sending all notifications")

            if should_send:
                logger.info(f"Sending notification to user {self.scope['user'].id}")
                await self.send_json({
                    'type': 'notification',
                    'id': event['id'],
                    'sender': event['sender'],
                    'receiver': event['receiver'],
                    'message': event['message'],
                    'timestamp': event['timestamp'],
                    'is_read': event['is_read'],
                    'user_role': event.get('user_role', None)
                })
            else:
                logger.info(f"Notification not sent. Target role: {target_role}, Target user: {target_user}")

        except Exception as e:
            logger.error(f"Error in sending notification: {e}")
            logger.error(traceback.format_exc())
            await self.send_json({
                'type': 'error',
                'message': str(e)
            })
