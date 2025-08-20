from rest_framework import permissions


class IsAdminOrComplaintParticipant(permissions.BasePermission):
    """
    صلاحية للسماح للأدمن أو المشاركين في الشكوى فقط
    """
    def has_object_permission(self, request, view, obj):
        # الأدمن والمشرف لهم صلاحية كاملة
        if request.user.role in ['admin', 'moderator']:
            return True
        
        # المشاركون في الشكوى لهم صلاحية
        return request.user in [obj.from_user, obj.to_user]
