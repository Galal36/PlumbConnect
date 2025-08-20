from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow only the owner or an admin to edit/delete the object.
    """

    def has_object_permission(self, request, view, obj):
        return request.user == obj.user or request.user.is_staff
