from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.ServiceCreateView.as_view()),
    path('list/', views.ServiceListView.as_view()),
    path('<int:pk>/', views.ServiceDetailView.as_view()),
    path('<int:pk>/update/', views.ServiceUpdateView.as_view()),
    path('<int:pk>/delete/', views.ServiceDeleteView.as_view()),

    path('<int:pk>/accept/', views.AcceptServiceView.as_view()),
    path('<int:pk>/reject/', views.RejectServiceView.as_view()),

    path('sent/', views.SentServicesView.as_view()),
    path('received/', views.ReceivedServicesView.as_view()),

    path('user/<int:user_id>/sent/', views.UserSentServicesView.as_view()),
    path('user/<int:user_id>/received/', views.UserReceivedServicesView.as_view()),

    path('status/pending/', views.PendingServicesView.as_view()),
    path('status/accepted/', views.AcceptedServicesView.as_view()),
    path('status/rejected/', views.RejectedServicesView.as_view()),

    # Service Review URLs
    path('reviews/create/', views.CreateServiceReviewView.as_view()),
    path('plumber/<int:plumber_id>/reviews/', views.PlumberReviewsView.as_view()),
    path('plumber/<int:plumber_id>/rating/', views.PlumberRatingView.as_view()),
]
