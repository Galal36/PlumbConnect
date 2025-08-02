from django.db import models
from users.models import User # Correctly import User model

# It's best practice to name your models using CamelCase (e.g., CommentReply)
# But I will stick to your naming for consistency.

class Post(models.Model):
    """
    Represents a main post created by any user in the community blog.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    statement = models.TextField()
    image = models.ImageField(upload_to='post_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Post by {self.user.name}'

class Comment(models.Model):
    """
    Represents a comment on a specific Post.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Comment by {self.user.name} on {self.post}'

class Comment_Reply(models.Model):
    """
    Represents a reply to a specific Comment.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_replies')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='replies')
    reply = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Reply by {self.user.name} on {self.comment}'


#Like or Dislike the post

class Like(models.Model):
    """
    Represents a 'like' on a Post by a User.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # This constraint ensures that a user can only like a specific post once.
        unique_together = ('user', 'post')

    def __str__(self):
        return f'Like by {self.user.name} on {self.post}'
