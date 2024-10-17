from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CourseViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
] + router.urls
