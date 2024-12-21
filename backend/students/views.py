from .permissions import IsEnrolledInCourse, IsEnrolledInCourseObj
from .serializers import (
    CartItemSerializer, CartItemListSerializer,
    WishItemSerializer, WishItemListSerializer,
    CourseWithEnrollmentSerializer,
    CourseWithEnrollRetrivalSerializer,
    OrderListSerializer, OrderSerializer,
    ReviewListSerializer, ReviewDetailSerializer,
    ChatMessageSerializer, ChatRoomSerializer,
    CourseChatMessageSerializer
)
from tutor.serializers import (
    CategoryOpenListSerializer, CategorySerializer,
    CourseListSerializer, CourseRetrivalSerializer,
    LessonSerializer,
)
from .models import (
    CartItem, WishList, OrderItem, Order,
    Enrolment, LessonProgress, Address, RazorpayOrders,
    Review, ChatRoom, ChatMessage,
    CourseChatRoom
)
from rest_framework.views import APIView
from tutor.models import Category, Lesson
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework import mixins, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Prefetch, Count, Avg
from django.db import transaction
from django.apps import apps
from django.utils import timezone
from .utils import client, key


class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class CartItemViewSet(mixins.CreateModelMixin,
                      mixins.ListModelMixin,
                      viewsets.GenericViewSet):

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return CartItemListSerializer
        else:
            return CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(customer=self.request.user.student)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = self.request.user.student

        course = serializer.validated_data['course']
        enrolment = Enrolment.objects.filter(
            course_id=course.id, student=student).exists()
        if enrolment:
            response = Response({
                "error": "Course already Enrollled",

            }, status=status.HTTP_400_BAD_REQUEST)
            return response
            # Check if the cart item already exists
        cart_item, created = CartItem.objects.get_or_create(
            course=course, customer=student
        )
        if created:
            response = Response(
                serializer.data, status=status.HTTP_201_CREATED)
            return response
        else:

            cart_item.delete()  # If it exists, delete it
            response = Response(
                None, status=status.HTTP_204_NO_CONTENT)
            return response

    @ action(
        detail=False, methods=['post'],
        permission_classes=[IsAuthenticated]
    )
    @ transaction.atomic
    def create_order(self, request):
        """
        Creates a new order from the cart items of the student,
        with optional wallet deduction.
        """
        student = request.user.student
        cart_items = CartItem.objects.filter(customer=student)

        if not cart_items.exists():
            return Response(
                {"error": "No items in the cart to create an order."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate address
        address_data = self._validate_address(request.data)
        if isinstance(address_data, Response):
            return address_data

        # Create the address
        try:
            address = Address.objects.create(**address_data)
        except Exception as e:
            return Response(
                {"error": f"Failed to create address: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Calculate total order amount
        total_amount = self._calculate_order_total(cart_items)

        # Handle wallet payment if applicable
        use_wallet = request.data.get('wallet') == 'on'
        payable = total_amount  # Start with full amount as payable
        try:
            if use_wallet:
                payable = self._handle_wallet_payment(student, total_amount)
        except Exception as e:
            return Response(
                {"error": f"Wallet processing failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine order status based on payable amount
        order_status = 'completed' if payable == 0 else 'pending'

        # Create the order
        try:
            order = Order.objects.create(
                student=student,
                address=address,
                total_amount=total_amount,
                payable=payable,
                status=order_status,
                # Mark as paid if fully covered by wallet
                is_paid=(payable == 0)
            )
        except Exception as e:
            return Response(
                {"error": f"Order creation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Create order items and clear the cart
        try:
            self._create_order_items(cart_items, order)
        except Exception as e:
            return Response(
                {"error": f"Failed to create order items: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Prepare response
        if payable == 0:

            return Response(
                {"message": "Order created and paid successfully.",
                 "order_id": order.id, "payable_amount": payable},
                status=status.HTTP_201_CREATED
            )
        else:
            rzr_order = self._create_razor_order(order)
            rzr_order["payable_amount"] = payable
            rzr_order["order_id"] = order.id
            return Response(
                {"message": "Order created successfully. Payment pending.",
                 **rzr_order
                 },
                status=status.HTTP_201_CREATED
            )

    def _create_razor_order(self, order):
        amount = int(order.payable*100)
        order_data = {
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1,
        }
        try:
            rzr_order = client.order.create(order_data)
            RazorpayOrders.objects.create(
                order=order, id=rzr_order['id'])
        except Exception as e:
            raise Exception(f"Razorpay order creation failed {str(e)}")
        return {"rzr_order": rzr_order, "key": key}

    def _validate_address(self, data):
        """
        Validates and extracts address data from the request.
        """
        address_data = {
            "name": data.get('fullName', ''),
            "street_address": data.get('streetAddress', ''),
            "city": data.get('city', ''),
            "state": data.get('state', ''),
            "postal_code": data.get('postalCode', ''),
            "country": data.get('country', 'India')
        }

        required_fields = ['name', 'street_address',
                           'city', 'state', 'postal_code', 'country']
        missing_fields = [
            field for field in required_fields if not address_data[field]]

        if missing_fields:
            return Response(
                {"error": f"Missing required address fields: {
                    ', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(address_data['postal_code']) < 5:
            return Response(
                {"error": "Postal code must be at least 5 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return address_data

    def _calculate_order_total(self, cart_items):
        """
        Calculates the total amount for the given cart items,
        applying any discounts.
        """
        return sum(self._calculate_discounted_price(item.course)
                   for item in cart_items)

    def _calculate_discounted_price(self, course):
        """
        Calculates the discounted price for a course.
        """
        if course.discount_percent:
            return course.price * (1 - (course.discount_percent / 100))
        return course.price

    def _handle_wallet_payment(self, student, total_amount):
        """
        Deducts the payable amount from the student's wallet if applicable.
        Returns the remaining payable amount.
        """
        wallet = getattr(student, 'wallet', None)
        if not wallet:
            raise Exception("No wallet found for the student.")

        payable = total_amount
        if wallet.wallet_balance >= payable:
            wallet.wallet_balance -= payable
            payable = 0  # Fully paid by wallet
        else:
            payable -= wallet.wallet_balance
            wallet.wallet_balance = 0

        wallet.save()
        return payable

    def _create_order_items(self, cart_items, order):
        """
        Creates order items from the cart items and clears the cart.
        """
        order_items = []
        for cart_item in cart_items:
            discounted_price = self._calculate_discounted_price(
                cart_item.course)

            order_items.append(OrderItem(
                order=order,
                course=cart_item.course,
                price=discounted_price
            ))
            cart_item.delete()  # Remove cart item after adding to the order
        OrderItem.objects.bulk_create(order_items)


class WishListViewSet(mixins.CreateModelMixin,
                      mixins.ListModelMixin,
                      viewsets.GenericViewSet):

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return WishItemListSerializer
        else:
            return WishItemSerializer

    def get_queryset(self):
        return WishList.objects.filter(customer=self.request.user.student)

    def perform_create(self, serializer):
        student = self.request.user.student
        course = serializer.validated_data['course']

        wish_item, created = WishList.objects.get_or_create(
            course=course, customer=student
        )

        if created:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            wish_item.delete()  # If it exists, delete it
            return Response(status=status.HTTP_204_NO_CONTENT)

    @ action(
        detail=False,
        methods=['post'], permission_classes=[IsAuthenticated]
    )
    def add_to_cart(self, request, pk=None):
        """
        Adds a specific item from the wishlist to the cart.
        """
        student = request.user.student
        # Retrieve the course ID from the request data
        course_id = request.data.get('course')

        if not course_id:
            return Response(
                {"error": "Course ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            wish_item = WishList.objects.get(
                course_id=course_id, customer=student)
            # Add to cart
            cart_item, created = CartItem.objects.get_or_create(
                course=wish_item.course, customer=student
            )
            if not created:
                return Response(
                    {"message": "Item is already in the cart."},
                    status=status.HTTP_200_OK
                )
            wish_item.delete()
            return Response(
                {"message": "Item added to cart successfully."},
                status=status.HTTP_201_CREATED
            )
        except WishList.DoesNotExist:
            return Response(
                {"error": "Item not found in the wishlist."},
                status=status.HTTP_404_NOT_FOUND
            )

    @ action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated]
    )
    def add_all_to_cart(self, request):
        """
        Adds all items from the wishlist to the cart.
        """
        student = request.user.student
        wish_items = WishList.objects.filter(customer=student)
        if not wish_items.exists():
            return Response(
                {"message": "No items in the wishlist to add to the cart."},
                status=status.HTTP_400_BAD_REQUEST
            )

        added_items = []
        for wish_item in wish_items:
            # Add to cart
            cart_item, created = CartItem.objects.get_or_create(
                course=wish_item.course, customer=student
            )
            if created:
                added_items.append(wish_item.course.title)
                wish_item.delete()

        if added_items:
            return Response(
                {"message": "Items added to cart successfully.",
                    "added_items": added_items},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {"message": "All items were already in the cart."},
                status=status.HTTP_200_OK
            )


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    lookup_field = 'slug'

    def get_serializer_class(self, *args, **kwargs):

        if self.action == 'list':
            return CategoryOpenListSerializer
        else:
            return CategorySerializer
        return super().get_serializer_class()


class CourseOpenViewSet(viewsets.ReadOnlyModelViewSet):

    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at']
    permission_classes = [AllowAny]

    def get_queryset(self):
        Course = apps.get_model("tutor", "Course")
        if self.request.user.is_authenticated:
            return Course.objects.select_related("teacher").filter(
                is_active=True,
                status=Course.PUBLISHED
            ).prefetch_related(
                Prefetch(
                    'enrolled_courses',
                    queryset=Enrolment.objects.filter(
                        student=self.request.user.student
                    ).prefetch_related(
                        Prefetch(
                            'lesson_progress',
                            queryset=LessonProgress.objects.select_related(
                                'lesson'),
                            to_attr='student_lesson_progress'
                        )
                    ),
                    to_attr='student_enrollment'
                )
            ).annotate(
                total_reviews=Count('reviews'),
                average_rating=Avg('reviews__rating')
            )
        else:
            return Course.objects.select_related("teacher").filter(
                is_active=True,
                status=Course.PUBLISHED
            ).annotate(
                total_reviews=Count('reviews'),
                average_rating=Avg('reviews__rating')
            )

    def get_serializer_class(self, *args, **kwargs):

        if self.request.user.is_authenticated:
            if self.action == 'list':
                return CourseWithEnrollmentSerializer
            else:
                return CourseWithEnrollRetrivalSerializer
        else:
            if self.action == 'list':
                return CourseListSerializer
            else:
                return CourseRetrivalSerializer

    @ action(
        detail=True, methods=['post'], permission_classes=[IsAuthenticated]
    )
    def enroll(self, request, *args, **kwargs):

        course = self.get_object()
        if course.price != 0.00 or (
            course.discount_percent is not None and
            course.discount_percent < 100
        ):

            return Response(
                {'error': 'Course is not available for Free.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        student = request.user.student

        enrollment, created = Enrolment.objects.get_or_create(
            course=course,
            student=student,
            defaults={
                'status': Enrolment.NOT_STARTED,
                'date_enrolled': timezone.now(),
                'payment_type': 'fr',
            }
        )
        if not created:
            return Response(
                {'message': 'Already enrolled in this course.'},
                status=status.HTTP_200_OK
            )

        return Response(
            {'message': 'Successfully enrolled in the course!'},
            status=status.HTTP_201_CREATED
        )

    @ action(
        detail=False, methods=['get'], permission_classes=[IsAuthenticated]
    )
    def enrolled_list(self, request, *args, **kwargs):
        """
        Retrieve a list of courses that the student is enrolled in.
        """
        student = request.user.student
        Course = apps.get_model("tutor", "Course")
        enrolled_courses = Course.objects.filter(
            enrolled_courses__student=student
        ).select_related('teacher').prefetch_related(
            Prefetch(
                'enrolled_courses',  # Related name on the Course model
                queryset=Enrolment.objects.filter(
                    student=self.request.user.student),
                to_attr='student_enrollment'  # filtered enrollments
            )
        )

        serializer = CourseWithEnrollmentSerializer(
            enrolled_courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=['post'], permission_classes=[IsEnrolledInCourseObj]
    )
    def rate(self, request, slug=None):
        """
        Allow authenticated students to rate a course.
        """
        course = self.get_object()
        student = request.user.student

        if not Enrolment.objects.filter(
            course=course, student=student
        ).exists():
            return Response(
                {"error": "You are not enrolled in this course."},
                status=status.HTTP_403_FORBIDDEN
            )

        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                return Response(
                    {"error": "Rating must be between 1 and 5."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {
                    "error": "Invalid rating value.\
                        It must be an integer between 1 and 5."},
                status=status.HTTP_400_BAD_REQUEST
            )

        review, created = Review.objects.update_or_create(
            student=student,
            course=course,
            defaults={'rating': rating, 'comment': comment}
        )

        if created:
            message = "Review created successfully."
            status_code = status.HTTP_201_CREATED
        else:
            message = "Review updated successfully."
            status_code = status.HTTP_200_OK
        return Response(
            {
                "message": message,
                "review": {
                    "course": course.title,
                    "rating": review.rating,
                    "comment": review.comment,
                    "created_at": review.created_at,
                    "updated_at": review.updated_at
                }
            },
            status=status_code
        )

    @action(
        detail=True,
        methods=['get'], permission_classes=[AllowAny]
    )
    def rate_list(self, request, slug=None):
        """Lists all reviews for a specific course."""
        Course = apps.get_model("tutor", "Course")
        try:
            course = Course.objects.get(slug=slug)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        reviews = Review.objects.filter(course=course, is_active=True)
        serializer = ReviewListSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=['get'], permission_classes=[IsAuthenticated]
    )
    def rate_detail(self, request, slug=None):
        """Retrieves the review of the current
        logged-in user for a specific course."""
        student = request.user.student
        Course = apps.get_model("tutor", "Course")
        try:
            course = Course.objects.get(slug=slug)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            review = Review.objects.get(course=course, student=student)
            serializer = ReviewDetailSerializer(review)
            return Response(serializer.data)
        except Review.DoesNotExist:
            return Response(
                {"error": "Review not found for this course and user."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def messages(self, request, slug=None):
        """Get chat messages for a course"""
        try:
            course = self.get_object()
            chat_room = CourseChatRoom.objects.get(course=course)
            messages = chat_room.messages.all().order_by('-timestamp')

            paginator = MessagePagination()
            paginated_messages = paginator.paginate_queryset(messages, request)
            serializer = CourseChatMessageSerializer(
                paginated_messages, many=True)

            return paginator.get_paginated_response(serializer.data)
        except CourseChatRoom.DoesNotExist:
            return Response(
                {"detail": "Chat room not found for this course."},
                status=status.HTTP_404_NOT_FOUND
            )


class LessonViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsEnrolledInCourse]

    def list(self, request, *args, **kwargs):
        raise MethodNotAllowed(
            "GET", detail="List method is not allowed on this viewset.")

    @ action(
        detail=True, methods=['post'], permission_classes=[IsEnrolledInCourse]
    )
    def lesson_started(self, request, *args, **kwargs):
        lesson = self.get_object()
        enrolment = Enrolment.objects.get(
            student=request.user.student, course=lesson.module.course
        )

        if not enrolment:
            return Response(
                {"error": "User is not enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if enrolment.status == 'notstarted':
            enrolment.status = 'active'

        enrolment.last_accessed = timezone.now()
        progress, created = LessonProgress.objects.get_or_create(
            enrolment=enrolment, lesson=lesson
        )
        if progress.status == 'not_started':
            progress.status = 'in_progress'
        progress.save()
        enrolment.save()
        return Response(
            {"message": "Lesson marked as started."},
            status=status.HTTP_200_OK
        )

    @ action(
        detail=True, methods=['post'],
        permission_classes=[IsEnrolledInCourse]
    )
    def lesson_completed(self, request, *args, **kwargs):
        lesson = self.get_object()
        enrolment = Enrolment.objects.get(
            student=request.user.student, course=lesson.module.course
        )

        if not enrolment:
            return Response(
                {"error": "User is not enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST
            )

        progress, created = LessonProgress.objects.get_or_create(
            enrolment=enrolment, lesson=lesson
        )

        progress.status = 'completed'
        progress.completed_at = timezone.now()
        progress.save()

        total_lessons = enrolment.lesson_progress.count()
        completed_lessons = enrolment.lesson_progress.filter(
            status='completed').count()

        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100
        else:
            progress_percentage = 0
        if progress_percentage == 100:
            enrolment.status = 'completed'
            enrolment.date_completed = timezone.now()
        enrolment.progress = progress_percentage
        enrolment.save()

        return Response(
            {"message": "Lesson marked as completed."},
            status=status.HTTP_200_OK
        )


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for viewing orders.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            student=self.request.user.student
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderSerializer
        return OrderListSerializer

    @ action(
        detail=False, methods=['post'],
        permission_classes=[IsAuthenticated]
    )
    @ transaction.atomic
    def complete_order(self, request):
        data = request.data
        with transaction.atomic():
            try:
                rzrOrder = RazorpayOrders.objects\
                    .prefetch_related('order').get(
                        id=data['razorpay_order_id']
                    )
                rzrOrder.rzr_payment_id = data['razorpay_payment_id']
                rzrOrder.rzr_signature = data['razorpay_signature']
                rzrOrder.order.status = 'completed'
                rzrOrder.order.is_paid = True
                rzrOrder.save()
                rzrOrder.order.save()
                return Response(
                    {"message": "Payment Succefull",
                     },
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"error": f"Error in Payment {str(e)}",
                     },
                    status=status.HTTP_400_BAD_REQUEST
                )

    @action(
        detail=True,
        methods=['POST'], permission_classes=[IsAuthenticated]
    )
    @transaction.atomic
    def request_refund(self, request, pk=None):
        """
        Request a refund for a specific order item by a student
        """
        try:
            # Get the order
            order = self.get_object()

            # Validate the student owns the order
            if order.student != request.user.student:
                return Response(
                    {"error": "You are not authorized to request\
                        a refund for this order."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get the specific order item to refund
            item_id = request.data.get('item_id')

            # Find the specific order item
            try:
                order_item = order.items.get(id=item_id)
            except OrderItem.DoesNotExist:
                return Response(
                    {"error": "Order item not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check refund eligibility
            if not order_item.can_be_refunded():
                return Response(
                    {"error": "This item is not eligible for refund.\
                        Check refund policy."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update order item status to refund pending
            order_item.refund_status = 'refund_pending'
            order_item.save()
            Notification = apps.get_model('core', 'Notification')
            User = apps.get_model('core', 'User')
            superusers = User.objects.filter(is_superuser=True)
            superuser_notification_message = (
                f"New Refund Request for Order #{order.id}, "
                f"Course: {order_item.course.title}, "
                f"Student: {order.student.user.get_full_name(
                ) or order.student.user.username}. "
            )

            for superuser in superusers:
                Notification.objects.create(
                    sender=self.request.user,
                    receiver=superuser,
                    message=superuser_notification_message,
                    user_role='admin'
                )

            return Response(
                {"message": "Refund request submitted successfully.\
                    Admin will review your request."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Refund request failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head']  # Only allow GET and POST

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'student'):
            course_slug = self.request.query_params.get('course_slug')
            if course_slug:
                return ChatRoom.objects.filter(
                    enrollment__student=user.student,
                    enrollment__course__slug=course_slug
                )
            return ChatRoom.objects.filter(enrollment__student=user.student)
        return ChatRoom.objects.none()

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        pass

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        room = self.get_object()
        messages_query = ChatMessage.objects.filter(room=room)
        paginator = MessagePagination()
        messages = paginator.paginate_queryset(messages_query, request)
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)


class StudentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        if not hasattr(request.user, 'student'):
            return Response({'error': 'User is not a student'}, status=403)

        student = request.user.student

        # Courses
        enrollments = Enrolment.objects.filter(student=student)
        courses_count_by_status = enrollments.values(
            'status').annotate(count=Count('status'))
        recent_courses = enrollments.order_by(
            '-last_accessed')[:3].values('course__title', 'progress', 'status')

        # Wallet
        wallet_balance = student.wallet.wallet_balance if hasattr(
            student, 'wallet') else 0.00

        # Notifications
        Notification = apps.get_model('core', 'Notification')
        recent_notifications = Notification.objects.filter(
            receiver=request.user
        ).order_by(
            '-timestamp')[:5].values('message', 'timestamp', 'is_read')

        data = {
            'courses': {
                'count_by_status': courses_count_by_status,
                'recent_courses': list(recent_courses),
            },
            'wallet': {
                'balance': wallet_balance,
            },
            'notifications': list(recent_notifications),
        }

        return Response(data)
