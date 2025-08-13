from django.urls import path
from . import views

app_name = 'complaints' # تأكد من وجود هذا السطر إذا لم يكن موجودًا

urlpatterns = [
    path('', views.ComplaintListCreateView.as_view(), name='complaint-list-create'),
    path('<int:pk>/', views.ComplaintDetailView.as_view(), name='complaint-detail'),
    path('<int:pk>/update/', views.ComplaintUpdateView.as_view(), name='complaint-update'),
    path('<int:pk>/delete/', views.ComplaintDeleteView.as_view(), name='complaint-delete'),
    path('my-complaints/', views.UserComplaintsView.as_view(), name='user-complaints'), # <--- هذا هو السطر المعدل
    path('admin-list/', views.AdminComplaintListView.as_view(), name='admin-complaint-list'),
    path('status/<str:status>/', views.ComplaintStatusView.as_view(), name='complaint-status'),
    path('count/', views.ComplaintCountView.as_view(), name='complaint-count'),
    path('<int:pk>/admin-update/', views.AdminComplaintUpdateView.as_view(), name='admin-complaint-update'),
]
