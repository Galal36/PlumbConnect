from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """يسمح فقط للمستخدمين الذين لديهم role = 'admin'"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    يسمح للإداري بالتعديل أو الحذف، ويسمح للمستخدم العادي فقط بالقراءة (GET)
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrOwner(permissions.BasePermission):
    """
    يسمح للإداري أو صاحب الحساب نفسه بالتعديل أو الحذف
    """
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or obj == request.user
