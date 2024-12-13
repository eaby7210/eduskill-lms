from django.apps import apps
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import (
    Student, Enrolment, LessonProgress,
    Order, ChatRoom
)
User = settings.AUTH_USER_MODEL


@receiver(post_save, sender=User)
def create_student_profile(sender, instance, created, **kwargs):
    """
    Create a Teacher profile if the user role is TUTOR.
    """
    if not hasattr(instance, 'student'):
        Student.objects.create(user=instance)
        instance.role = "STUD"
        instance.save()


@receiver(post_save, sender=Enrolment)
def create_chat_room(sender, instance, created, **kwargs):
    """Automatically create chat room when enrollment is created"""
    if created:
        ChatRoom.objects.create(enrollment=instance)


@receiver(post_save, sender=Enrolment)
def create_lesson_progress(sender, instance, created, **kwargs):
    """
    Signal to create LessonProgress instances for all lessons in a course
    when an Enrolment is created.
    """
    if created:  # Only create LessonProgress for new enrolments
        Lesson = apps.get_model("tutor", "Lesson")
        lessons = Lesson.objects.filter(module__course=instance.course)
        for lesson in lessons:
            LessonProgress.objects.create(
                enrolment=instance,
                lesson=lesson,
                status='not_started'  # Set default status
            )


@receiver(post_save, sender=Order)
def create_enrolment_on_order_completion(sender, instance, **kwargs):
    # Only proceed if the order status is completed
    if instance.status == 'completed':
        order_items = instance.items.all()  # Access related order items
        for order_item in order_items:
            course = order_item.course
            student = instance.student

            # Create an enrolment if it doesn't already exist
            # for this student and course
            enrolment, created = Enrolment.objects.get_or_create(
                course=course,
                student=student,
                defaults={
                    'status': Enrolment.ACTIVE,
                    'payment_type': 'p',
                    'date_enrolled': instance.order_date
                }
            )

            if created:
                print(f"Enrolment created for {student} in course {course}.")
            else:
                print(f"Enrolment already exists for {
                      student} in course {course}.")
