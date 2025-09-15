from django.urls import path
from .views.roomview import RoomCreateView, RoomListView, RoomUpdateView, RoomDeleteView, RoomDetailView
from .views.serviceviews import ServiceListView, ServiceCreateView, ServiceDetailView, ServiceUpdateView, ServiceDeleteView
from .views.service_booking import ServiceBookingView, BookingListView, BookingStatusUpdateView
from .views.menuviews import MealListView, MealCreateView, MealDetailView, MealUpdateView, MealDeleteView, OrderListView, OrderCreateView, OrderDetailView
# from .views.speechRecognition import voice_to_text

urlpatterns = [
    path("rooms/", RoomListView.as_view(), name="room-list"),
    path("rooms/create/", RoomCreateView.as_view(), name="room-create"),
    path("rooms/<str:room_id>", RoomDetailView.as_view(), name="room-detail"),
    path("rooms/<str:room_id>/update/", RoomUpdateView.as_view(), name="room-update"),
    path("rooms/<str:room_id>/delete/", RoomDeleteView.as_view(), name="room-delete"),
    
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('services/create/', ServiceCreateView.as_view(), name='service-create'),
    path('services/<str:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('services/<str:pk>/update/', ServiceUpdateView.as_view(), name='service-update'),
    path('services/<str:pk>/delete/', ServiceDeleteView.as_view(), name='service-delete'),

    path('services/<str:service_id>/book/', ServiceBookingView.as_view(), name='service-book'),
    path("bookings/", BookingListView.as_view(), name="booking-list"),
    path("bookings/<str:booking_id>/status/", BookingStatusUpdateView.as_view(), name="booking-status-update"),
    
    # path("voice-to-text/", voice_to_text, name="voice_to_text"),
    
    path("meals/", MealListView.as_view(), name="meal-list"),
    path("meals/create/", MealCreateView.as_view(), name="meal-create"),
    path("meals/<str:meal_id>/", MealDetailView.as_view(), name="meal-detail"),
    path("meals/<str:meal_id>/update/", MealUpdateView.as_view(), name="meal-update"),
    path("meals/<str:meal_id>/delete/", MealDeleteView.as_view(), name="meal-delete"),
    
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<str:order_id>/', OrderDetailView.as_view(), name='order-detail'),
]