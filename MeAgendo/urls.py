from django.contrib import admin
from django.urls    import path, include

urlpatterns = [
    path('',                   include('core.urls')),
    path('accounts/',          include('accounts.urls')),
    path('accounts/password/', include('password_reset.urls', namespace='password_reset')),
    path('admin/',             admin.site.urls),
    path('calendar/',          include('dashboard.urls', namespace='dashboard')),
]
