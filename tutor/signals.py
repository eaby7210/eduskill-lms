from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.apps import apps
from .models import VideoContent, Course
from .tasks import encode_video_task
User = settings.AUTH_USER_MODEL


@receiver(post_save, sender=VideoContent)
def video_handler(sender, instance, created, **kwargs):
    print("singal")
    if created and instance.status == 'pending':
        print(instance.status)
        try:
            encode_video_task.delay(instance.id)
        except Exception as e:
            print(f"Error optimizing video: {e}")


@receiver(post_save, sender=Course)
def create_course_chat_room(sender, instance, created, **kwargs):
    if created:
        CourseChatRoom = apps.get_model("students", "CourseChatRoom")
        CourseChatRoom.objects.create(course=instance)
