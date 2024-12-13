from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
# from rest_framework.urls import urlpatterns as urls
import core.urls
import tutor.urls
import myadmin.urls
import students.urls


urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include(core.urls)),
    path("", include(tutor.urls)),
    path("", include(students.urls)),
    path("myadmin/", include(myadmin.urls)),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
