from rest_framework import serializers
from reviews.models import Review

class ReviewSerializer(serializers.ModelSerializer):
    maker_username = serializers.CharField(source='maker.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'rate', 'description', 'maker', 'receiver', 'maker_username', 'receiver_username']
        read_only_fields = ['maker']
