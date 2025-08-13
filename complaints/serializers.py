from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Complaint
from chats.models import Chat
from notifications.models import Notification
from django.utils.translation import gettext_lazy as _
<<<<<<< HEAD

User = get_user_model()

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'image', 'is_verified']
=======
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'image', 'status']

>>>>>>> plumb_

class ComplaintSerializer(serializers.ModelSerializer):
    from_user = UserBasicSerializer(read_only=True)
    to_user = UserBasicSerializer(read_only=True)
    resolved_by = UserBasicSerializer(read_only=True, allow_null=True)
    from_user_name = serializers.CharField(source='from_user.name', read_only=True)
    to_user_name = serializers.CharField(source='to_user.name', read_only=True)
    resolved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = ['id', 'title', 'description', 'complaint_type', 'from_user',
                  'to_user', 'chat', 'status', 'created_at', 'updated_at',
                  'resolved_by', 'admin_notes', 'from_user_name', 'to_user_name',
                  'resolved_by_name']
        read_only_fields = ['from_user', 'created_at', 'updated_at']

    def get_resolved_by_name(self, obj):
        return obj.resolved_by.name if obj.resolved_by else None

<<<<<<< HEAD
=======

>>>>>>> plumb_
class ComplaintCreateSerializer(serializers.ModelSerializer):
    to_user_id = serializers.IntegerField(write_only=True)
    chat_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Complaint
        fields = ['title', 'description', 'complaint_type', 'to_user_id', 'chat_id']

    def validate(self, data):
        to_user_id = data.get('to_user_id')
        chat_id = data.get('chat_id')
        from_user = self.context['request'].user

        try:
            to_user = User.objects.get(id=to_user_id)
            if from_user == to_user:
                raise serializers.ValidationError(
                    _("Cannot file a complaint against yourself.")
                )
            if from_user.role == to_user.role:
                raise serializers.ValidationError(
                    _("Complaint must be between a client and a plumber.")
                )
        except User.DoesNotExist:
            raise serializers.ValidationError(_("Receiver does not exist."))

        if chat_id:
            try:
                chat = Chat.objects.get(id=chat_id)
                if from_user not in [chat.sender, chat.receiver]:
                    raise serializers.ValidationError(
                        _("You are not a participant in this chat.")
                    )
            except Chat.DoesNotExist:
                raise serializers.ValidationError(_("Chat does not exist."))

        return data

    def create(self, validated_data):
        to_user_id = validated_data.pop('to_user_id')
        chat_id = validated_data.pop('chat_id', None)
        to_user = User.objects.get(id=to_user_id)
        from_user = self.context['request'].user
<<<<<<< HEAD
=======

>>>>>>> plumb_
        chat = Chat.objects.get(id=chat_id) if chat_id else None

        complaint = Complaint.objects.create(
            from_user=from_user,
            to_user=to_user,
            chat=chat,
            **validated_data
        )

<<<<<<< HEAD
=======
        complaint_content_type = ContentType.objects.get_for_model(Complaint)

>>>>>>> plumb_
        Notification.objects.create(
            user=to_user,
            title=_("شكوى جديدة"),
            content=_("شكوى جديدة من %(name)s") % {'name': from_user.name},
            notification_type='complaint_status',
            is_important=True,
            action_url=f"http://localhost:8000/api/complaints/{complaint.id}/",
<<<<<<< HEAD
            content_type="complaints.complaint",
=======
            content_type=complaint_content_type,
>>>>>>> plumb_
            object_id=complaint.id
        )

        return complaint

<<<<<<< HEAD
=======

>>>>>>> plumb_
class ComplaintUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['status', 'admin_notes', 'resolved_by']
        read_only_fields = ['resolved_by']
