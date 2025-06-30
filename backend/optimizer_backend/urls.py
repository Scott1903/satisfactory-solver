from django.urls import path, re_path
from optimizer import views  # Import views from the optimizer app

urlpatterns = [
    path("optimize/", views.OptimizeView.as_view(), name="optimize"),
    path("api/metadata/", views.get_all_metadata, name="get_all_metadata"),
    path("api/default-settings/", views.get_default_settings, name="get_default_settings"),
    re_path(r'^.*$', views.index, name="frontend"),  # fallback route to serve React
]

# For development only
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)