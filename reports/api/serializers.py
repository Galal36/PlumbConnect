from rest_framework import serializers
from reports.models import Report
from django.contrib.contenttypes.models import ContentType


class ReportSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        slug_field='model',
        queryset=ContentType.objects.all()
    )

    class Meta:
        model = Report
        fields = ['id', 'reason', 'user', 'content_type', 'object_id', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
