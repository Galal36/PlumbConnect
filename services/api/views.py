from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Avg
from services.models import Service, ServiceReview
from .serializers import ServiceSerializer, ServiceReviewSerializer
from notifications.utils import NotificationService

User = get_user_model()


class ServiceCreateView(generics.CreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        service = serializer.save(sender=self.request.user, status='pending')

        # Send notifications for new service request
        try:
            client = service.sender
            plumber = service.receiver  # The field is called 'receiver', not 'plumber'

            # Create notifications
            NotificationService.notify_service_request(client, plumber, service.id)
        except Exception as e:
            # Log error but don't fail the service creation
            print(f"Failed to send service request notification: {e}")


class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class ServiceDetailView(generics.RetrieveAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class ServiceUpdateView(generics.UpdateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class ServiceDeleteView(generics.DestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


# Accept / Reject
class AcceptServiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            service = Service.objects.get(id=pk, status='pending')

            # Update service status and amount if provided
            service.status = 'accepted'
            if 'price' in request.data:
                service.amount = request.data['price']

            service.save()

            # Return the updated service object
            serializer = ServiceSerializer(service)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Service.DoesNotExist:
            return Response({'detail': 'Not found or not pending'}, status=status.HTTP_404_NOT_FOUND)


class RejectServiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            service = Service.objects.get(id=pk, status='pending')
            service.status = 'rejected'
            service.save()

            # Return the updated service object
            serializer = ServiceSerializer(service)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Service.DoesNotExist:
            return Response({'detail': 'Not found or not pending'}, status=status.HTTP_404_NOT_FOUND)


# Filters
class SentServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(sender=self.request.user)


class ReceivedServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(receiver=self.request.user)


class UserSentServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Service.objects.filter(sender__id=user_id)


class UserReceivedServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Service.objects.filter(receiver__id=user_id)


class PendingServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(status='pending')


class AcceptedServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(status='accepted')


class RejectedServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(status='rejected')


# Service Review Views
class CreateServiceReviewView(generics.CreateAPIView):
    serializer_class = ServiceReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        service_request = serializer.validated_data['service_request']

        # Ensure the service is accepted and the user is the sender
        if service_request.status != 'accepted':
            from rest_framework.exceptions import ValidationError
            raise ValidationError('يمكن تقييم الخدمات المقبولة فقط')

        if service_request.sender != self.request.user:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('يمكنك تقييم الخدمات التي طلبتها فقط')

        # Check if review already exists
        if ServiceReview.objects.filter(service_request=service_request).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('تم تقييم هذه الخدمة مسبقاً')

        review = serializer.save()

        # Send notifications for new review
        try:
            reviewer = self.request.user
            plumber = service_request.receiver  # The field is called 'receiver', not 'plumber'
            rating = review.rating

            # Create notifications
            NotificationService.notify_service_review(reviewer, plumber, rating, service_request.id)
        except Exception as e:
            # Log error but don't fail the review creation
            print(f"Failed to send service review notification: {e}")


class PlumberReviewsView(generics.ListAPIView):
    serializer_class = ServiceReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        plumber_id = self.kwargs['plumber_id']
        return ServiceReview.objects.filter(plumber__id=plumber_id)


class PlumberRatingView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, plumber_id):
        reviews = ServiceReview.objects.filter(plumber__id=plumber_id)

        if not reviews.exists():
            return Response({
                'average_rating': 0,
                'total_reviews': 0
            })

        average_rating = reviews.aggregate(Avg('rating'))['rating__avg']
        total_reviews = reviews.count()

        return Response({
            'average_rating': round(average_rating, 1) if average_rating else 0,
            'total_reviews': total_reviews
        })
