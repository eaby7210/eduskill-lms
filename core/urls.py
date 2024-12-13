from django.urls import include, path
from rest_framework.routers import SimpleRouter
from .views import UserUpdateView, NotificationViewSet
router = SimpleRouter()
router.register('user/notifications', NotificationViewSet,
                basename="notifications")
urlpatterns = [
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/register/', include('dj_rest_auth.registration.urls')),
    path('auth/user/update/', UserUpdateView.as_view(), name="user_update"),
    path('', include(router.urls))

]
