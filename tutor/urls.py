from django.urls import path
from django.urls.conf import include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter


open_router = DefaultRouter()
tutor_router = DefaultRouter()

open_router.register(
    prefix='category', viewset=views.CategoryViewSet, basename='catogories'
    )
open_router.register(
    prefix='courses', viewset=views.CourseOpenViewSet, basename='courses'
)

tutor_router.register(
    prefix='courses', viewset=views.CourseViewSet, basename='tutor_courses'
)

course_router = NestedDefaultRouter(tutor_router, 'courses', lookup='course')
course_router.register(
    'modules', viewset=views.ModuleViewSet, basename="tutor_modules"
    )

module_router = NestedDefaultRouter(course_router, 'modules', lookup='module')
module_router.register(
    'lessons', viewset=views.LessonViewSet, basename="tutor_lessons"
    )

urlpatterns = [
    path('', include(open_router.urls)),
    path('tutor/', include(tutor_router.urls)),
    path('tutor/', include(course_router.urls)),
    path('tutor/', include(module_router.urls)),
]
