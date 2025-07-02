from django.contrib import admin
from django.urls import path, include

urlpatterns = [
  path('', include('core.urls')),
  path('accounts/', include('accounts.urls')),
  path('admin/', admin.site.urls),
  path('accounts/password/', include('password_reset.urls', namespace='password_reset')),
]
