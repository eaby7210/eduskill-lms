from rest_framework import serializers
from django.apps import apps
from .models import (
    Student, CartItem, WishList,
    LessonProgress, Order, OrderItem,
    Address, Review, ChatMessage, ChatRoom,
    CourseChatRoom, CourseChatMessage
)
from tutor.serializers import (
    CourseListSerializer
)
Course = apps.get_model('tutor', 'Course')


class StudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Student
        fields = [
            'id', 'bio',
            'is_verified', 'created_at',
            'updated_at'
        ]


class StudentUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Student
        fields = [
            'id', 'bio',
        ]


class CartItemListSerializer(serializers.ModelSerializer):
    course = CourseListSerializer()

    class Meta:
        model = CartItem
        fields = ['id', 'course', 'created_at']


class WishItemListSerializer(serializers.ModelSerializer):
    course = CourseListSerializer()

    class Meta:
        model = WishList
        fields = ['id', 'course']


class CartItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = CartItem
        fields = ['id', 'course', 'created_at']

    def validate_course(self, value):
        """
        Check if the course exists before adding to cart.
        """
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(
                "The selected course does not exist."
            )
        return value


class WishItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = WishList
        fields = ['id', 'course']

    def validate_course(self, value):
        """
        Check if the course exists before adding to wishlist.
        """
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(
                "The selected course does not exist."
            )
        return value


class CourseWithEnrollmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    affected_price = serializers.SerializerMethodField()
    enrollment_status = serializers.SerializerMethodField()
    date_enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    total_reviews = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = apps.get_model("tutor", "Course")
        fields = [
            'id', 'title', 'slug', 'description', 'is_active',
            'price', 'discount_percent', 'duration',
            'course_thumbnail', 'category', 'status',
            'teacher_name', 'affected_price',
            'enrollment_status', 'date_enrolled', 'progress',
            'total_reviews', 'average_rating',
        ]
        read_only_fields = [
            'id', 'slug', 'is_active', 'created_at', 'updated_at',
            'total_reviews', 'average_rating',
        ]

    def get_affected_price(self, obj):
        if obj.discount_percent:
            discount_amount = (obj.price * obj.discount_percent) / 100
            return round(obj.price - discount_amount, 2)
        return obj.price

    def get_teacher_name(self, obj):
        return f'{obj.teacher.user.first_name} {obj.teacher.user.last_name}'

    def get_enrollment_status(self, obj):
        # Access the student-specific enrollment data
        # loaded with `to_attr='student_enrollment'`
        enrollment = obj.student_enrollment[0] \
            if obj.student_enrollment else None
        return enrollment.status if enrollment else None

    def get_date_enrolled(self, obj):
        enrollment = obj.student_enrollment[0] \
            if obj.student_enrollment else None
        return enrollment.date_enrolled if enrollment else None

    def get_progress(self, obj):
        enrollment = obj.student_enrollment[0] \
            if obj.student_enrollment else None
        return enrollment.progress if enrollment else None


class LessonProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonProgress
        fields = [
            'id', 'status', 'completed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class LessonEnrolledListSeraiLizer(serializers.ModelSerializer):

    progress_status = serializers.SerializerMethodField()
    progress_completed_at = serializers.SerializerMethodField()
    progress_created_at = serializers.SerializerMethodField()
    progress_updated_at = serializers.SerializerMethodField()

    class Meta:
        model = apps.get_model("tutor", "Lesson")
        fields = [
            'id', 'title', 'description', 'lesson_type',
            'duration', 'order', 'is_active',
            'module', 'progress_status',
            'progress_completed_at', 'progress_created_at',
            'progress_updated_at'
        ]

    def get_progress_status(self, obj):
        # Retrieve progress status if progress is available
        progress = self._get_student_progress(obj)
        return progress.status if progress else None

    def get_progress_completed_at(self, obj):
        # Retrieve completed_at if progress is available
        progress = self._get_student_progress(obj)
        return progress.completed_at if progress else None

    def get_progress_created_at(self, obj):
        # Retrieve created_at if progress is available
        progress = self._get_student_progress(obj)
        return progress.created_at if progress else None

    def get_progress_updated_at(self, obj):
        # Retrieve updated_at if progress is available
        progress = self._get_student_progress(obj)
        return progress.updated_at if progress else None

    def _get_student_progress(self, lesson):
        request = self.context.get('request')
        if not request:
            return None

        student_enrollments = getattr(
            lesson.module.course, 'student_enrollment', [])
        if not student_enrollments:
            return None

        enrolment = student_enrollments[0]
        if not hasattr(enrolment, 'student_lesson_progress'):
            return None
        # Find the progress related to the given lesson
        progress = next(
            (lp for lp in enrolment.student_lesson_progress
                if lp.lesson_id == lesson.id),
            None
        )
        return progress


class ModuleEnrolledListSerializer(serializers.ModelSerializer):
    lessons = LessonEnrolledListSeraiLizer(many=True)

    class Meta:
        model = apps.get_model("tutor", "Module")
        fields = [
            'id', 'title', 'description',
            'order', 'duration', 'is_active', 'lessons',
        ]


class CourseWithEnrollRetrivalSerializer(CourseWithEnrollmentSerializer):
    modules = ModuleEnrolledListSerializer(many=True)
    category = serializers.SerializerMethodField()

    class Meta(CourseWithEnrollmentSerializer.Meta):
        fields = CourseWithEnrollmentSerializer.Meta.fields + [
            'syllabus', 'requirements', 'learning_objectives',
            'target_audience', 'completion_certificate',
            'modules', 'popularity_score', 'category'
        ]
        read_only_fields = \
            CourseWithEnrollmentSerializer.Meta.read_only_fields + [
                'popularity_score'
            ]

    def get_category(self, obj):
        return obj.category.name if obj.category else None


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'name', 'street_address', 'city',
            'state', 'postal_code', 'country'
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'course', 'course_title', 'price']


class OrderListSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    address_details = serializers.CharField(
        source='address.street_address', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'student_name', 'status', 'total_amount',
                  'is_paid', 'order_date', 'address_details']

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"


class OrderSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    address = AddressSerializer()
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'student', 'student_name', 'address', 'status',
            'total_amount', 'payable', 'is_paid', 'order_date',
            'created_at', 'updated_at', 'items'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"


class ReviewListSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'student_name',  'course_title',
            'rating', 'comment', 'created_at'
        ]
        read_only_fields = ('created_at', 'student_name',  'course_title',)

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"


class ReviewDetailSerializer(ReviewListSerializer):
    class Meta(ReviewListSerializer.Meta):
        model = Review
        fields = ReviewListSerializer.Meta.fields + [
            'student', 'course', 'updated_at',
            'is_active', 'is_flagged'
        ]
        read_only_fields = ReviewListSerializer.Meta.read_only_fields + \
            ('updated_at', 'is_active', 'is_flagged',)


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(
        source='sender.username', read_only=True)
    sender_role = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'content', 'timestamp', 'sender',
                  'sender_name', 'sender_role', 'is_read']

    def get_sender_role(self, obj):
        if hasattr(obj.sender, 'student'):
            return 'student'
        elif hasattr(obj.sender, 'teacher'):
            return 'teacher'
        return 'unknown'


class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    course_title = serializers.CharField(
        source='enrollment.course.title', read_only=True)
    student_name = serializers.CharField(
        source='enrollment.student.user.username', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'enrollment', 'course_title', 'student_name',
            'teacher_name', 'created_at', 'updated_at', 'last_message',
            'unread_count',
        ]

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return ChatMessageSerializer(last_message).data
        return None

    def get_teacher_name(self, obj):
        user = obj.enrollment.course.teacher.user
        return f"{user.first_name} {user.last_name}"

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()


class CourseChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseChatRoom
        fields = ['id', 'course', 'created_at', 'updated_at', 'is_active']


class CourseChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseChatMessage
        fields = ['id', 'room', 'sender', 'content', 'timestamp']
