from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Posts(models.Model):
    username = models.CharField(max_length=25, null=True)
    content = models.TextField(null=True)
    timestamp = models.DateTimeField(null=True)
    likes = models.IntegerField(null=True)
    dislikes = models.IntegerField(null=True)
    last_edit = models.DateTimeField(null=True)

class Connections(models.Model):
    username = models.CharField(max_length=25, null=True)
    followed_by = models.CharField(max_length=25, null=True)


class Likes(models.Model):
    post_id = models.ForeignKey(Posts, on_delete=models.CASCADE, related_name='post_likes')
    follower = models.CharField(max_length=25, null=True)