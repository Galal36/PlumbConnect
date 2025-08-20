from rest_framework import permissions


class IsAdminOrChatParticipant(permissions.BasePermission):
    """
    صلاحية للسماح للأدمن أو المشاركين في المحادثة فقط
    """
    def has_object_permission(self, request, view, obj):
        # الأدمن له صلاحية كاملة
        if request.user.role == 'admin':
            return True
        
        # المشاركون في المحادثة لهم صلاحية
        return request.user in [obj.sender, obj.receiver]
