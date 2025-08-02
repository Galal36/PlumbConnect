from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'is_approved', 'created_at')
    list_filter = ('is_approved',)
    list_editable = ('is_approved',) # Allows you to change status from the list view