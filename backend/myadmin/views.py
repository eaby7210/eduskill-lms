import os
from django.apps import apps
from django.db import transaction
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Count, Sum
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from core.serializers import UserListSerializer
from students.serializers import OrderSerializer, OrderListSerializer
from tutor.serializers import (
    CourseSerializer, CourseListSerializer,
    CourseRetrivalSerializer,
    ModuleAllListSerializer, VideoContent,
    CategoryListSerializer, CategorySerializer
)

User = get_user_model()


class UserViewSet(ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'],
            permission_classes=[IsAdminUser]
            )
    def toggle_activation(self, request, pk=None):

        user = self.get_object()
        user.is_active = not user.is_active  # Toggle activation
        user.save()
        Notification = apps.get_model('core', 'Notification')
        Notification.objects.create(
            sender=request.user,
            receiver=user,
            message="Your account has been blocked by admin"
        )
        status_message = 'User activated'\
            if user.is_active else\
            'User deactivated'
        return Response({'status': status_message}, status=status.HTTP_200_OK)


class CourseViewSet(ReadOnlyModelViewSet):
    Course = apps.get_model('tutor', 'Course')
    queryset = Course.objects.filter(
        status__in=['published', 'pending_approval'])
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):

        if self.action == 'retrieve':
            return CourseRetrivalSerializer
        elif self.action in ['list', 'create', 'update']:
            return CourseSerializer
        return CourseListSerializer

    @action(detail=True, methods=['post'],
            permission_classes=[IsAdminUser]
            )
    def publish(self, request, pk=None):
        """
        Custom action to publish a course.
        """
        course = self.get_object()
        if course.status == "pending_approval":
            course.is_active = True
            course.published_at = timezone.now()
            course.status = "published"
            course.save()
            Notification = apps.get_model('core', 'Notification')
            Notification.objects.create(
                sender=request.user,
                receiver=course.teacher.user,
                message=f"Your course '{
                    course.title
                }' has been approved and published to the public.",
                user_role="TUTR"
            )

            return Response(
                {'status': 'Course published'},
                status=status.HTTP_200_OK
            )
        return Response(
            {'error': 'Course already published or inactive'},
            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'],
            permission_classes=[IsAdminUser]
            )
    def block(self, request, pk=None):
        """
        Custom action to publish a course.
        """
        course = self.get_object()
        if course.status in ["published"]:
            course.status = "blocked"
            course.save()
            Notification = apps.get_model('core', 'Notification')
            Notification.objects.create(
                sender=request.user,
                receiver=course.teacher.user,
                message=f"Your course '{
                    course.title
                }' has been blocked.Please review the course details,\
                    And Submit again",
                user_role="TUTR"
            )
            return Response(
                {'status': 'Course Blocked'},
                status=status.HTTP_200_OK
            )
        return Response(
            {'error': 'Course already published or an invalid status'},
            status=status.HTTP_400_BAD_REQUEST)


class ModuleViewSet(ReadOnlyModelViewSet):
    serializer_class = ModuleAllListSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        course_id = self.kwargs["course_pk"]
        Module = apps.get_model('tutor', 'Module')
        return Module.objects.filter(course=course_id)

    @action(
        detail=True,
        methods=['get'], permission_classes=[IsAdminUser]
    )
    def get_hls(self, request, slug=None, *args, **kwargs):
        lesson_id = request.query_params.get('lesson_id')

        if not lesson_id:
            return Response(
                {'error': 'Lesson ID not provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            video_content = VideoContent.objects.get(lesson_id=lesson_id)

            if video_content.status != "Completed":
                return Response(
                    {'error': 'Video is not processed yet.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Construct the path to the m3u8 file
            output_directory = os.path.join(
                os.path.dirname(video_content.video_file.path), 'hls_output')
            output_hls_path = os.path.join(
                output_directory, os.path.basename(video_content.hls))

            # Read the contents of the m3u8 file
            with open(output_hls_path, 'r') as file:
                m3u8_content = file.read()

            dynamic_path = request.build_absolute_uri(
                '/media/lessons/videos/hls_output/')
            m3u8_content = m3u8_content.replace(
                "{{ dynamic_path }}", dynamic_path)

            return HttpResponse(
                m3u8_content, content_type='application/vnd.apple.mpegurl'
            )
        except VideoContent.DoesNotExist:
            return Response(
                {'error': 'Video content not found for this lesson.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CategoryViewSet(ModelViewSet):

    serializer_class = CategoryListSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == "list":
            return CategoryListSerializer
        else:
            return CategorySerializer

    def get_queryset(self):
        Category = apps.get_model("tutor", "Category")
        if self.action == "list":
            return Category.objects.filter(parent__isnull=True)
        return Category.objects.all()

    @action(
        detail=True,
        methods=['post'], permission_classes=[IsAdminUser]
    )
    def toggle_active(self, request, *args, **kwargs):
        category = self.get_object()
        new_status = not category.is_active
        with transaction.atomic():
            category.is_active = new_status
            category.save()
            if not category.parent:
                category.subcategories.update(is_active=new_status)

        status_message = 'Category activated' \
            if new_status else 'Category deactivated'
        return Response({'status': status_message}, status=status.HTTP_200_OK)


class DashboardAPIView(APIView):
    # permission_classes = [IsAdminUser]
    def get(self, request, format=None):
        # Teachers
        Course = apps.get_model('tutor', 'Course')
        Teacher = apps.get_model('tutor', 'Teacher')
        Student = apps.get_model('students', 'Student')
        Order = apps.get_model('students', 'Order')
        active_teachers_count = Teacher.objects.filter(is_active=True).count()

        # Courses
        total_courses_count = Course.objects.count()
        courses_by_status = Course.objects.values(
            'status').annotate(count=Count('status'))

        # Students
        active_students_count = Student.objects.filter(is_active=True).count()

        # Orders
        total_orders_count = Order.objects.count()
        orders_by_status = Order.objects.values(
            'status').annotate(count=Count('status'))
        total_revenue = Order.objects.filter(status='completed').aggregate(
            Sum('total_amount'))['total_amount__sum'] or 0.00

        data = {
            'teachers': {
                'active_count': active_teachers_count,
            },
            'courses': {
                'total_count': total_courses_count,
                'by_status': courses_by_status,
            },
            'students': {
                'active_count': active_students_count,
            },
            'orders': {
                'total_count': total_orders_count,
                'by_status': orders_by_status,
                'total_revenue': total_revenue,
            }
        }

        return Response(data)


class OrderViewSet(ReadOnlyModelViewSet):
    '''
    Viewset for admin to manage and view orders.
    '''

    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_paid', 'refund_status']
    search_fields = [
        'student__username', 'course__title',
        'student__user__first_name',
        'student__user__last_name',
        'student__user__email',
    ]
    ordering_fields = ['items__update_at', 'created_at', 'total_amount']

    def get_queryset(self):
        Order = apps.get_model("students", "Order")
        return Order.objects.all().select_related('student', 'address')

    def get_serializer_class(self):
        if self.action == 'retrive':
            return OrderSerializer
        return OrderListSerializer

    @action(
        detail=True, methods=['POST'],
        permission_classes=[IsAdminUser]
    )
    @transaction.atomic
    def process_refund(self, request, pk=None):
        '''
        Preocess a refund request for specific order
        '''
        Notification = apps.get_model('core', 'Notification')
        order = self.get_object()
        item_id = request.data.get('item_id')
        refund_decision = request.data.get('decision')
        OrderItem = apps.get_model('Students', 'OrderItem')
        try:
            try:
                order_item = order.item.get(id=item_id)
            except OrderItem.DoesNotExist:
                return Response(
                    {"error": "Order item not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            if order_item.refund_status != 'refund_pending':
                return Response(
                    {"error": "No pending refund request found."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            student_notification_message = (
                f"Refund Request for Course: {
                    order_item.course.title} has been "
                f"{'Approved' if refund_decision == 'approve' else
                    'Rejected'}."
            )
            Notification.objects.create(
                sender=self.request.user,
                receiver=order.student.user,
                message=student_notification_message,
                user_role='student'
            )

            # Process refund based on admin decision
            if refund_decision == 'approve':
                # Process full refund
                self._approve_refund(order, order_item)

                return Response({
                    "message": "Refund approved and processed successfully.",
                    "refund_amount": order_item.price
                })

            elif refund_decision == 'reject':
                # Reject refund request
                self._reject_refund(order, order_item)

                return Response({
                    "message": "Refund request rejected.",
                })

            else:
                return Response(
                    {"error": "Invalid refund decision.\
                        Must be 'approve' or 'reject'."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response(
                {"error": f"Refund processing failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _approve_refund(self, order, order_item):
        """
        Internal method to approve and process a refund
        """

        Wallet = apps.get_model('students', 'Wallet')
        # Update order item refund status
        order_item.refund_status = 'refunded'
        order_item.refund_processed_at = timezone.now()
        order_item.save()
        # Create wallet transaction for refund
        wallet = Wallet.objects.get(student=order.student)
        wallet.wallet_balance = order_item.price
        wallet.save()

        # Update order refund status
        remaining_items = order.items.exclude(refund_status='refunded')
        if not remaining_items.exists():
            order.refund_status = 'full_refund'
        else:
            order.refund_status = 'partial_refund'
        order.save()

        # Optional: Unenroll student from the course
        order_item.course.enrolled_courses.filter(
            student=order.student
        ).delete()

    def _reject_refund(self, order, order_item):
        """
        Internal method to reject a refund request
        """
        # Reset order item status to not_refunded
        order_item.refund_status = 'not_refunded'
        order_item.save()
