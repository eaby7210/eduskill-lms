from django.utils import timezone
from django.db import models
from django.conf import settings
# from django.core.validators import MinValueValidator


# Create your models here.
class Student(models.Model):
    user = models.OneToOneField(
        unique=True,
        db_index=True,
        related_name="student",
        on_delete=models.CASCADE,
        to=settings.AUTH_USER_MODEL,
        verbose_name="Student Profile",
        related_query_name="student"
    )
    bio = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Wallet(models.Model):
    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name='wallet',
        verbose_name="Student Wallet"
    )
    wallet_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Current wallet balance of the student."
    )

    def __str__(self):
        return f"Wallet of {
            self.student.user.username
        } - Balance: {self.wallet_balance}"


class CartItem(models.Model):
    course = models.ForeignKey('tutor.Course', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    customer = models.ForeignKey(
        Student, on_delete=models.CASCADE,
        related_name='cart_items'
    )

    class Meta:
        unique_together = [['course', 'customer']]


class WishList(models.Model):
    course = models.ForeignKey(
        'tutor.Course', on_delete=models.CASCADE,
        related_name="wish_Courses"
    )
    customer = models.ForeignKey(
        Student, on_delete=models.CASCADE,
        related_name="wish_list"
    )

    class Meta:
        unique_together = [['course', 'customer']]


class Enrolment(models.Model):

    NOT_STARTED = 'notstarted'
    ACTIVE = 'active'
    COMPLETED = 'completed'
    ENROLLMENT_STATUS_CHOICES = [
        (ACTIVE, 'Active'),
        (COMPLETED, 'Completed'),
        (NOT_STARTED, 'Not Started')
    ]

    course = models.ForeignKey(
        'tutor.Course', on_delete=models.CASCADE,
        related_name="enrolled_courses"
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE,
        related_name="enrolments"
    )
    status = models.CharField(
        max_length=10,
        choices=ENROLLMENT_STATUS_CHOICES,
        default=ACTIVE
    )

    date_enrolled = models.DateTimeField(default=timezone.now)
    date_completed = models.DateTimeField(null=True, blank=True)

    progress = models.DecimalField(
        max_digits=5, decimal_places=2,
        default=0.00, help_text="Percentage completion of the course."
    )

    payment_type = models.CharField(
        max_length=2, choices=[
            ('p', 'Paid'),
            ('fr', 'Free')
        ], default='not_paid'
    )

    last_accessed = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['course', 'student']

    def __str__(self):
        return f"{self.student} - {self.course} - {self.status}"


class LessonProgress(models.Model):

    enrolment = models.ForeignKey(
        Enrolment,
        on_delete=models.CASCADE, related_name="lesson_progress"
    )
    lesson = models.ForeignKey(
        'tutor.Lesson', on_delete=models.CASCADE, related_name='progress')

    status = models.CharField(
        max_length=20,
        choices=[
            ('not_started', 'Not Started'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed')
        ],
        default='not_started'
    )

    completed_at = models.DateTimeField(
        null=True, blank=True
    )  # Time when the student marked the lesson as complete

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Address(models.Model):

    name = models.CharField(
        max_length=200, blank=True,
        help_text="Name associated with the address."
    )
    street_address = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(
        max_length=50, default="India"
    )


class Order (models.Model):
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('refunded', 'Refunded'),
    ]
    student = models.ForeignKey(
        Student, on_delete=models.DO_NOTHING,
        related_name="orders"
    )
    address = models.ForeignKey(
        Address, on_delete=models.CASCADE,
        related_name="orders"
    )
    order_date = models.DateTimeField(
        default=timezone.now
    )
    status = models.CharField(
        max_length=10, choices=ORDER_STATUS_CHOICES,
        default='pending'
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payable = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-order_date']

    def __str__(self):
        return f"Order #{self.id} - {self.student}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE,
        related_name='items'
    )
    course = models.ForeignKey(
        'tutor.Course', on_delete=models.CASCADE,
        related_name='order_items'
    )
    price = models.DecimalField(
        max_digits=7, decimal_places=2,
        help_text="Price of the course at the time of purchase"
    )

    def __str__(self):
        return f"OrderItem #{self.id} - {self.course.title}"


class RazorpayOrders(models.Model):
    id = models.CharField(max_length=500, primary_key=True, unique=True)
    order = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name='razor_orders')
    rzr_payment_id = models.CharField(max_length=500, null=True, blank=True)
    rzr_signature = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self) -> str:
        return str(self.order.id)+" "+str(self.id)


class Review(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='reviews',
        db_index=True,
    )
    course = models.ForeignKey(
        'tutor.Course',
        on_delete=models.CASCADE,
        related_name='reviews',
        db_index=True,
    )
    rating = models.PositiveSmallIntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],)
    comment = models.TextField(blank=True,)
    created_at = models.DateTimeField(auto_now_add=True,)
    updated_at = models.DateTimeField(auto_now=True,)
    is_active = models.BooleanField(default=True,)
    is_flagged = models.BooleanField(default=False,)

    class Meta:
        # A student can review a course only once
        unique_together = ('student', 'course')
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.student.user.username}\
            for {self.course.title}"


class ChatRoom(models.Model):
    enrollment = models.OneToOneField(
        Enrolment,
        on_delete=models.CASCADE,
        related_name='chat_room',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat: {
            self.enrollment.student.user.username
        } - {
            self.enrollment.course.teacher.user.username
        } ({self.enrollment.course.title})"


class ChatMessage(models.Model):
    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Message from {
            self.sender.username
        } at {self.timestamp}"


class CourseChatRoom(models.Model):
    course = models.ForeignKey(
        'tutor.Course',
        on_delete=models.CASCADE,
        related_name='chat_rooms',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Course Chat: {self.course.title}"


class CourseChatMessage(models.Model):
    room = models.ForeignKey(
        CourseChatRoom,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {
            self.sender.username
        } in {self.room.course.title}"
