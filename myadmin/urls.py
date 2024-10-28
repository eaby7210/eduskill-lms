from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CourseViewSet, ModuleViewSet
from rest_framework_nested.routers import NestedDefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet, basename='course')

course_router = NestedDefaultRouter(router, 'courses', lookup="course")
course_router.register(
    'modules', viewset=ModuleViewSet, basename="course_modules"
)


urlpatterns = [
    path("", include(course_router.urls))
] + router.urls
