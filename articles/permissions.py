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
        
        # For any write action, the user must be authenticated.
        if not request.user.is_authenticated:
            return False

        # --- THIS IS THE NEW, SMARTER LOGIC ---
        # If the action is 'create' (POST), only a plumber can do it.
        if request.user.role=='admin' and view.action=='create':
            return request.user.role == 'admin'
            

        if view.action == 'create':
            return request.user.role == 'plumber'
        
        # For other actions like 'update' or 'destroy', we allow the request
        # to proceed. The final decision will be made by has_object_permission.
        return True

    def has_object_permission(self, request, view, obj):
        """
        Allow read-only access for anyone.
        For write permissions, only allow the author OR an admin to edit/delete.
        """
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # --- THIS IS THE CORRECTED LOGIC ---
        # Write permissions are allowed to the author of the article OR any admin.
        return obj.user == request.user or request.user.role == 'admin'
