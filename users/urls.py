from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    UserViewSet, LocationViewSet, CustomTokenObtainPairView, ActivateAccountView,
    PasswordResetRequestView, PasswordResetConfirmView # Import new views
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('locations', LocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('activate/<str:uidb64>/<str:token>/', ActivateAccountView.as_view(), name='activate'),
    
    #Password reset, in case forgetting it
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

]
