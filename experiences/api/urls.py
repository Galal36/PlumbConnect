# experiences/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExperienceViewSet, UserExperiencesView, MyExperiencesView

router = DefaultRouter()
router.register(r'experiences', ExperienceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('my-experiences/', MyExperiencesView.as_view(), name='my_experiences'),
    path('user-experiences/<int:user_id>/', UserExperiencesView.as_view(), name='user_experiences'),
]
