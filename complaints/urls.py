from django.urls import path
from . import views

<<<<<<< HEAD
app_name = 'complaints'

urlpatterns = [
    # CRUD Operations للشكاوى
    path('', views.ComplaintListCreateView.as_view(), name='complaint-list'),
    path('<int:pk>/', views.ComplaintDetailView.as_view(), name='complaint-detail'),
    path('<int:pk>/update/', views.ComplaintUpdateView.as_view(), name='complaint-update'),
    path('<int:pk>/delete/', views.ComplaintDeleteView.as_view(), name='complaint-delete'),

    # شكاوى المستخدم
    path('my-complaints/', views.MyComplaintsView.as_view(), name='my-complaints'),
    path('against-me/', views.ComplaintsAgainstMeView.as_view(), name='complaints-against-me'),
    path('user/<int:user_id>/', views.UserComplaintsView.as_view(), name='user-complaints'),

    # حسب الحالة
    path('pending/', views.PendingComplaintsView.as_view(), name='pending-complaints'),
    path('in-progress/', views.InProgressComplaintsView.as_view(), name='in-progress-complaints'),
    path('resolved/', views.ResolvedComplaintsView.as_view(), name='resolved-complaints'),
    path('rejected/', views.RejectedComplaintsView.as_view(), name='rejected-complaints'),

    # حسب النوع
    path('type/<str:complaint_type>/', views.ComplaintsByTypeView.as_view(), name='complaints-by-type'),

    # إجراءات الإدارة
    path('<int:pk>/resolve/', views.ResolveComplaintView.as_view(), name='resolve-complaint'),
    path('<int:pk>/reject/', views.RejectComplaintView.as_view(), name='reject-complaint'),

    # البحث والإحصائيات
    path('search/', views.SearchComplaintsView.as_view(), name='search-complaints'),
    path('statistics/', views.ComplaintStatisticsView.as_view(), name='complaint-statistics'),
    path('export/', views.ExportComplaintsView.as_view(), name='export-complaints'),
=======
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
>>>>>>> plumb_
]
