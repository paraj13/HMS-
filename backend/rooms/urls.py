from django.urls import path
from .views.roomview import RoomListCreateView, RoomDetailView
from .views.serviceviews import ServiceListCreateView, ServiceDetailView
from .views.service_booking import ServiceBookingView, BookingListView, BookingStatusUpdateView
from .views.menuviews import MealListView, MealCreateView, MealDetailView, MealUpdateView, MealDeleteView
from .views.speechRecognition import voice_to_text

urlpatterns = [
    path("rooms/", RoomListCreateView.as_view(), name="room-list-create"),
    path("rooms/<str:room_id>", RoomDetailView.as_view(), name="room-detail"),
    
    path('services/', ServiceListCreateView.as_view(), name='service-list-create'),
    path('services/<str:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('services/<str:service_id>/book/', ServiceBookingView.as_view(), name='service-book'),
    path("bookings/", BookingListView.as_view(), name="booking-list"),
    path("bookings/<str:booking_id>/status/", BookingStatusUpdateView.as_view(), name="booking-status-update"),
    
    path("voice-to-text/", voice_to_text, name="voice_to_text"),
    
    # path("meals/", MealListCreateView.as_view(), name="menu-list-create"),
    # path("meals/<str:meal_id>/", MealDetailView.as_view(), name="menu-detail"),
    path("meals/", MealListView.as_view(), name="meal-list"),
    path("meals/create/", MealCreateView.as_view(), name="meal-create"),
    path("meals/<str:meal_id>/", MealDetailView.as_view(), name="meal-detail"),
    path("meals/<str:meal_id>/update/", MealUpdateView.as_view(), name="meal-update"),
    path("meals/<str:meal_id>/delete/", MealDeleteView.as_view(), name="meal-delete"),
]