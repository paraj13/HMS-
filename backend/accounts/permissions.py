# backend/accounts/permissions.py
from rest_framework.permissions import BasePermission

class RolePermission(BasePermission):
    """
    Allows access only to users with specific roles.
    """

    def has_permission(self, request, view):
        user = getattr(request, "user", None)

        if not user or not getattr(user, "id", None):  
            return False

        if hasattr(view, "allowed_roles"):
            return user.role in view.allowed_roles

        return True
