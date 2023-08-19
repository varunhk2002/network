
from django.urls import path
from django.http import HttpResponse
from django.views.generic.base import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage

from . import views

app_name='network'


urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post/", views.new_post, name="new_post"),
    path('favicon.ico/', RedirectView.as_view(url='/static/img/favicon.ico', permanent = True)),
    path('editform/<int:id>/', views.editform, name='editform'),
    path('profile/<str:username>/', views.profile, name='profile'),
    path('follow/', views.follow, name='follow'),
    path('unfollow/', views.unfollow, name='unfollow,'),
    path('following/', views.following, name='following'),
    path('like/', views.like, name='like'),
    path('unlike/', views.unlike, name='unlike')
]

