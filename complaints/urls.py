from django.urls import path
from . import views

app_name = 'complaints'

urlpatterns = [
    path('', views.ComplaintListCreateView.as_view(), name='complaint-list'),
    path('<int:pk>/', views.ComplaintDetailView.as_view(), name='complaint-detail'),
    path('stats/', views.ComplaintStatsView.as_view(), name='complaint-stats'),
]
