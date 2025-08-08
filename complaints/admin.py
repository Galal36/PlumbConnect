from django.contrib import admin
from .models import Complaint

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'from_user', 'to_user', 'status', 'created_at')
    list_filter = ('status', 'complaint_type')
    search_fields = ('title', 'description', 'from_user__name', 'to_user__name')
