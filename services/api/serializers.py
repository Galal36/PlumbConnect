from rest_framework import serializers
from services.models import Service, ServiceReview
from users.serializers import UserSerializer

class ServiceSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    receiver_details = UserSerializer(source='receiver', read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'sender', 'receiver', 'sender_details', 'receiver_details',
                 'status', 'amount', 'created_at', 'updated_at']
        read_only_fields = ['sender', 'status', 'sender_details', 'receiver_details',
                           'created_at', 'updated_at']


class ServiceReviewSerializer(serializers.ModelSerializer):
    reviewer_details = UserSerializer(source='reviewer', read_only=True)
    plumber_details = UserSerializer(source='plumber', read_only=True)

    class Meta:
        model = ServiceReview
        fields = ['id', 'service_request', 'reviewer', 'plumber', 'reviewer_details',
                 'plumber_details', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['reviewer', 'plumber', 'reviewer_details', 'plumber_details',
                           'created_at', 'updated_at']

    def create(self, validated_data):
        # Get the service request
        service_request = validated_data['service_request']

        # Set reviewer as the current user (sender of the service request)
        validated_data['reviewer'] = service_request.sender

        # Set plumber as the receiver of the service request
        validated_data['plumber'] = service_request.receiver

        return super().create(validated_data)
