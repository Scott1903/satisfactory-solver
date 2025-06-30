from django.contrib import admin
from django.urls import path, re_path
from optimizer.views import (
    OptimizeView,
    get_all_metadata,
    get_default_settings,
    FrontendAppView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('optimize/', OptimizeView.as_view(), name='optimize'),
    path('api/metadata/', get_all_metadata, name='metadata'),
    path('api/default-settings/', get_default_settings, name='default-settings'),

    # Catch-all for React routes (must come last)
    re_path(r'^.*$', FrontendAppView.as_view(), name='frontend'),
]

from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)