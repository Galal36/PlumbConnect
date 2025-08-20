from rest_framework import permissions


class IsAdminOrNotificationRecipient(permissions.BasePermission):
    """
    صلاحية للسماح للأدمن أو مستقبل الإشعار فقط
    """
    def has_object_permission(self, request, view, obj):
        # الأدمن له صلاحية كاملة
        if request.user.role == 'admin':
            return True
        
        # مستقبل الإشعار له صلاحية
        return obj.user == request.user
