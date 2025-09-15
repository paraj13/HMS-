from rest_framework.views import APIView
from accounts.authentication import JWTAuthentication
from accounts.permissions import RolePermission
from backend.utils.response import success_response, error_response
from rooms.models import Meal, Order
from rooms.serializers.menuserializers import MealSerializer, OrderSerializer


# ---------------------- LIST ----------------------
class MealListView(APIView):
    def get(self, request):
        meals = Meal.objects.all().order_by("-created_at")
        serializer = MealSerializer()
        data = [serializer.to_representation(m) for m in meals]
        return success_response(data, "Meals fetched successfully")


# ---------------------- CREATE ----------------------
class MealCreateView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["management", "staff"]

    def post(self, request):
        print(request)
        if request.user.role not in self.allowed_roles:
            return error_response("Permission denied", 403)

        serializer = MealSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            meal = serializer.save()
            return success_response(
                serializer.to_representation(meal),
                "Meal created successfully",
                201
            )
        return error_response("Validation error", serializer.errors)


# ---------------------- DETAIL ----------------------
class MealDetailView(APIView):
    def get_object(self, meal_id):
        return Meal.objects(id=meal_id).first()

    def get(self, request, meal_id):
        meal = self.get_object(meal_id)
        if not meal:
            return error_response("Meal not found", 404)

        serializer = MealSerializer()
        return success_response(serializer.to_representation(meal), "Meal details fetched successfully")


# ---------------------- UPDATE ----------------------
class MealUpdateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["management", "staff"]

    def get_object(self, meal_id):
        return Meal.objects(id=meal_id).first()

    def put(self, request, meal_id):
        if request.user.role not in self.allowed_roles:
            return error_response("Permission denied", 403)

        meal = self.get_object(meal_id)
        if not meal:
            return error_response("Meal not found", 404)

        serializer = MealSerializer(meal, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            updated_meal = serializer.save()
            return success_response(serializer.to_representation(updated_meal), "Meal updated successfully")
        return error_response("Validation error", serializer.errors)


# ---------------------- DELETE ----------------------
class MealDeleteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["management", "staff"]

    def get_object(self, meal_id):
        return Meal.objects(id=meal_id).first()

    def delete(self, request, meal_id):
        if request.user.role not in self.allowed_roles:
            return error_response("Permission denied", 403)

        meal = self.get_object(meal_id)
        if not meal:
            return error_response("Meal not found", 404)

        meal.delete()
        return success_response(message="Meal deleted successfully", status_code=204)


# ---------------------- LIST ORDERS ----------------------
class OrderListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["management", "staff"]

    def get(self, request):
        if request.user.role not in self.allowed_roles:
            return error_response("Permission denied", 403)

        orders = Order.objects.all().order_by("-created_at")
        serializer = OrderSerializer()
        data = [serializer.to_representation(o) for o in orders]
        return success_response(data, "Orders fetched successfully")


# ---------------------- CREATE ORDER ----------------------
class OrderCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["management", "staff", "guest"]  # adjust roles as needed

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            order = serializer.save()
            return success_response(serializer.to_representation(order), "Order placed successfully", 201)
        return error_response("Validation error", serializer.errors)


# ---------------------- ORDER DETAIL ----------------------
class OrderDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RolePermission]
    allowed_roles = ["management", "staff", "guest"]

    def get_object(self, order_id):
        return Order.objects(id=order_id).first()

    def get(self, request, order_id):
        order = self.get_object(order_id)
        if not order:
            return error_response("Order not found", 404)
        serializer = OrderSerializer()
        return success_response(serializer.to_representation(order), "Order details fetched successfully")