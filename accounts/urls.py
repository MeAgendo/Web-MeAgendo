from django.urls import path
from .views       import signup,login_view,logout_view,check_username,check_email

app_name = 'accounts'

urlpatterns = [
    path('signup/',          signup,         name='signup'),
    path('login/',           login_view,     name='login'),
    path('logout/',          logout_view,    name='logout'),
    path('check-username/',  check_username, name='check_username'),
    path('check-email/',     check_email,    name='check_email'),
]
