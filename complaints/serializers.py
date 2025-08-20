from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Complaint

User = get_user_model()


class ComplaintUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'phone']


class ComplaintSerializer(serializers.ModelSerializer):
    from_user = ComplaintUserSerializer(read_only=True)
    to_user = ComplaintUserSerializer(read_only=True)
    resolved_by = ComplaintUserSerializer(read_only=True)
    complaint_type_display = serializers.CharField(source='get_complaint_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Complaint
        fields = ['id', 'from_user', 'to_user', 'complaint_type', 'complaint_type_display',
                 'description', 'related_chat', 'status', 'status_display', 'admin_notes',
                 'resolved_by', 'created_at', 'updated_at', 'resolved_at']
        read_only_fields = ['id', 'from_user', 'resolved_by', 'created_at', 'updated_at', 'resolved_at']


class ComplaintCreateSerializer(serializers.ModelSerializer):
    to_user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Complaint
        fields = ['to_user_id', 'complaint_type', 'description']

    def validate_to_user_id(self, value):
        try:
            to_user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("المستخدم المحدد غير موجود")

        from_user = self.context['request'].user

        # منع الشكوى ضد النفس
        if from_user == to_user:
            raise serializers.ValidationError("لا يمكن تقديم شكوى ضد نفسك")

        # التحقق من الأدوار
        if from_user.role == to_user.role:
            raise serializers.ValidationError("يجب أن تكون الشكوى بين عميل وسباك")

        return value

    def create(self, validated_data):
        to_user_id = validated_data.pop('to_user_id')

        to_user = User.objects.get(id=to_user_id)

        complaint = Complaint.objects.create(
            from_user=self.context['request'].user,
            to_user=to_user,
            **validated_data
        )

        # إرسال إشعار للمستخدم المشكو ضده
        from utils.notification_helpers import notify_new_complaint
        notify_new_complaint(complaint, self.context.get('request'))

        return complaint


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['status', 'admin_notes']

    def validate_status(self, value):
        user = self.context['request'].user
        if user.role not in ['admin', 'moderator']:
            raise serializers.ValidationError("ليس لديك صلاحية لتغيير حالة الشكوى")
        return value

    def update(self, instance, validated_data):
        old_status = instance.status
        complaint = super().update(instance, validated_data)
        
        # إرسال إشعار عند تغيير الحالة
        if 'status' in validated_data and old_status != complaint.status:
            from utils.notification_helpers import notify_complaint_status_change
            notify_complaint_status_change(complaint, request=self.context.get('request'))
        
        return complaint
