from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import datetime
import json
from django.http import JsonResponse
from django.core import serializers
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from csp.decorators import csp_exempt

from .models import User, Posts, Connections

@csp_exempt
def index(request):
    if request.method == 'GET':
        wallet = request.GET.get('page', 1)
        #print(wallet)
        post_list = Posts.objects.all().order_by('-timestamp')
        p = Paginator(post_list, 10)
        page_obj = p.get_page(wallet)
        page_obj_test = p.get_page(13)
        #print(list(page_obj_test))
        # nums = page_obj.paginator.num_pages
        # print(nums)
        user = request.user.username

        

        try:
            paginated_argument = p.page(wallet)
        except PageNotAnInteger:
            paginated_argument = p.page(1)
        except EmptyPage:
            paginated_argument = p.page(p.num_pages)


        return render(request, "network/index.html", {
                "posts":post_list,
                "get_check": "True",
                "user_check": user,
                "page_obj":paginated_argument,
                # "nums":nums
            })
    else:
        post_list = Posts.objects.all().order_by('-timestamp')
        posts = serializers.serialize('json', list(post_list), fields=('username','content','timestamp','likes','dislikes'))
        return JsonResponse(posts, safe=False)
        
@csp_exempt
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("network:index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

@csp_exempt
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("network:index"))

@csp_exempt
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("network:index"))
    else:
        return render(request, "network/register.html")

@csp_exempt
@login_required(login_url='/login')
def new_post(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data["body"])
        timestamp = datetime.datetime.now()
        post_save = Posts(username = request.user.username, content= data["body"], timestamp=timestamp)
        post_save.save()
        return JsonResponse({"message":"Post saved"})
    

@csp_exempt
@login_required(login_url='/login')
def editform(request, id):
    if request.method == 'PUT':
        data = json.loads(request.body)
        body = data["body"]
        timestamp = datetime.datetime.now()
        post_update = Posts.objects.get(id=id)
        post_update.content = body
        post_update.last_edit = timestamp
        post_update.save()

        context = dict()
        context["data"] = body
        context["timestamp"] = timestamp

        return JsonResponse({"data":body, "timestamp":timestamp, "id":id})


@csp_exempt
def profile(request, username):
    user = request.user.username
    user_posts = list(Posts.objects.filter(username=username).order_by('-timestamp'))
    check_con = list(Connections.objects.filter(username=username).filter(followed_by=user))
    follower_count = list(Connections.objects.filter(username=username))
    following_count = list(Connections.objects.filter(followed_by=username))
    con_status = ""
    if len(check_con) >= 1:
        con_status = "0"
    return render(request, "network/profile.html", {
        "username": username,
        "user_posts": user_posts,
        "user_check":user,
        "con_status":con_status,
        "follower_count": len(follower_count),
        "following_count":len(following_count)
    })


@csp_exempt
@login_required(login_url='/login')
def follow(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data['body'])
        follower = data['body']
        user = request.user.username
        connect_save = Connections(username = follower, followed_by = user)
        connect_save.save()
        follower_count = list(Connections.objects.filter(username=follower))
        return JsonResponse({'follower_count': follower_count})

@csp_exempt
@login_required(login_url='/login')
def unfollow(request):
    if request.method == 'DELETE':
        data = json.loads(request.body)
        tounfollow = data['body']
        print(data['body'])
        user = request.user.username
        connect_delete = Connections.objects.get(username = tounfollow, followed_by = user)
        connect_delete.delete()
        follower_count = list(Connections.objects.filter(username=tounfollow))
        return JsonResponse({"message": "success"})


@csp_exempt
@login_required(login_url='/login')
def following(request):
    following_post_username = list(Connections.objects.filter(followed_by=request.user.username))
    posts_list = []
    for i in range(len(following_post_username)):
        usernames = following_post_username[i].username
        follow_posts = list(Posts.objects.filter(username=usernames))
        for j in range(len(follow_posts)):
            posts_list.append(follow_posts[j])
    return render(request, 'network/following.html', {
        "following_posts": posts_list
    })

@csp_exempt
@login_required(login_url='/login')
def like(request):
    pass


@csp_exempt
@login_required(login_url='/login')
def unlike(request):
    pass
