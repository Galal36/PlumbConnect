from rest_framework import permissions

class IsMakerOrReadOnly(permissions.BasePermission):
    """
    Only the maker can edit or delete the review. Others can only read.
    """
    def has_object_permission(self, request, view, obj):
        # Read-only permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write/delete only allowed to the maker
        return obj.maker == request.user
