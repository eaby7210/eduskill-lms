from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CartItemViewSet, WishListViewSet,
    CategoryViewSet, CourseOpenViewSet,
    LessonViewSet, OrderViewSet, ChatRoomViewSet,
    StudentDashboardAPIView
)

router = DefaultRouter()
open_router = DefaultRouter()
router.register('cart', CartItemViewSet, basename='cart')
router.register('wishlist', WishListViewSet, basename='wishlist')
router.register('lesson', LessonViewSet, basename="lesson")
router.register('order', viewset=OrderViewSet, basename="user_orders")
router.register('chats', ChatRoomViewSet, basename='chats')
open_router.register(
    prefix='category', viewset=CategoryViewSet, basename='catogories'
)
open_router.register(
    prefix='courses', viewset=CourseOpenViewSet, basename='courses'
)

urlpatterns = [
    path('', include(open_router.urls)),
    path('user/', include(router.urls)),
    path('user/dashboard/', StudentDashboardAPIView.as_view(),
         name='student-dashboard'),
]
