from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({"message": "PawMatch API is running", "endpoints": {"api": "/api/", "admin": "/admin/"}})

urlpatterns = [
    path('', api_root_view),
    path('admin/', admin.site.urls),
    path('api/', include('pawmatch_api.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
