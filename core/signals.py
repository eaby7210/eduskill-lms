from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
# # from django.conf import settings
# from .models import User
# from tutor.models import Teacher  # Import Teacher model
# from students.models import Student  # Import Student model


@receiver(post_save, sender=Notification)
def send_notification(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        notification_data = {
            'type': 'sendnotification',
            'id': instance.id,
            'sender': instance.sender_id,
            'receiver': instance.receiver_id,
            'message': instance.message,
            'timestamp': instance.timestamp.isoformat(),
            'is_read': instance.is_read,
            'user_role': instance.user_role
        }
        print(notification_data)
        # Send to user-specific group
        async_to_sync(channel_layer.group_send)(
            f'notification_{instance.receiver_id}',
            notification_data
        )
