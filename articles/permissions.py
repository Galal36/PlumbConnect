# articles/permissions.py
from rest_framework import permissions


#This class allows only admins to approve the articles
class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsPlumberOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to anyone.
    Only allows write access (create, update, delete) to authenticated plumbers.
    """
    def has_permission(self, request, view):
        # Allow GET, HEAD, or OPTIONS requests (read-only) for anyone.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Deny write access if the user is not authenticated or not a plumber.
        return request.user.is_authenticated and request.user.role == 'plumber'

    def has_object_permission(self, request, view, obj):
        """
        Allow read-only access for anyone.
        For write permissions, only allow the author of the article to edit it.
        """
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the author of the article.
        return obj.user == request.user