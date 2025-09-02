# app/urls.py
from django.urls import path
from .views.authview import LoginUserView, CreateUserView, UserListView, UserUpdateView, UserDeleteView, LogoutUserView, DashboardView, UserDetailView

urlpatterns = [
                path('login/', LoginUserView.as_view(), name='login_user'),
                path("logout", LogoutUserView.as_view(), name="logout"),
                path("dashboard/", DashboardView.as_view(), name="dashboard_api"),
                path('create/', CreateUserView.as_view(), name='create_user'),
                path("list/", UserListView.as_view(), name="list_users"),
                path("update/<str:user_id>", UserUpdateView.as_view(), name="update_user"),
                path("delete/<str:user_id>", UserDeleteView.as_view(), name="delete_user"),
                path("detail/<str:user_id>", UserDetailView.as_view(), name="user_detail"),
        ]
