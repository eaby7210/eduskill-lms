from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartItemViewSet, WishListViewSet

router = DefaultRouter()
router.register('cart', CartItemViewSet, basename='cart')
router.register('wishlist', WishListViewSet, basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
]
