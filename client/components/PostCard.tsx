import { useState, useMemo, useCallback, memo } from "react";
import { MessageCircle, MoreHorizontal, AlertCircle, Flag, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { postsApiService } from "@/services/postsApi";
import {
  formatTimeAgo,
  getAvatarInitials,
  getUserRoleDisplayName,
  formatError,
  getProfileUrl,
} from "@/utils";
import { cn } from "@/lib/utils";
import type { Post, Comment, PostCardProps, Reply } from "@/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import ReportForm from "@/components/ReportForm";
import DropdownMenu, { createEditDeleteItems } from "@/components/DropdownMenu";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditPostDialog from "@/components/EditPostDialog";
import EditCommentDialog from "@/components/EditCommentDialog";
import { usePostReports, useCommentReports, useReplyReports } from "@/hooks/useApi";

export const PostCard = memo(function PostCard({
  post,
  onPostUpdate,
}: PostCardProps) {
  const { isAuthenticated, user } = useAuthContext();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  // New hooks for reports
  const { data: postReports, refetch: refetchPostReports } = usePostReports(post.id);
  const myPostReport = useMemo(() => {
    return postReports?.find(report => report.user.id === user?.id);
  }, [postReports, user]);

  const formattedTime = useMemo(
    () => formatTimeAgo(post.created_at),
    [post.created_at],
  );

  const handleToggleLike = async () => {
    if (!isAuthenticated) return;
    // Optimistic UI update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = prevCount + (nextLiked ? 1 : -1);
    setIsLiked(nextLiked);
    setLikesCount(Math.max(0, nextCount));

    try {
      const status = await postsApiService.toggleLike(post.id);
      // If backend response contradicts optimistic state, reconcile
      if (status === 201 && !nextLiked) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      } else if (status === 204 && nextLiked) {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      // Rollback on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      console.error("Error toggling like:", error);
      setError(formatError(error));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    setError(null);

    try {
      const comment = await postsApiService.createComment({
        comment: newComment,
        post: post.id,
      });

      setComments((prev) => [...prev, comment]);
      setNewComment("");

      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          comments: [...comments, comment],
          comments_count: (post.comments_count || 0) + 1,
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError(formatError(error));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditPost = async (updatedPost: Post) => {
    try {
      if (onPostUpdate) {
        onPostUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError('فشل في تعديل المنشور. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await postsApiService.deletePost(post.id);
      
      if (onPostUpdate) {
        onPostUpdate(null as any);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(formatError(error));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const isPostOwner = user?.id === post.user.id;

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={getProfileUrl(post.user.id, post.user.role)}
              className="hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
                <AvatarImage src={post.user.image} />
                <AvatarFallback>
                  {getAvatarInitials(post.user.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link
                  to={getProfileUrl(post.user.id, post.user.role)}
                  className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer"
                >
                  {post.user.name}
                </Link>
                {post.user.is_verified && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    متحقق
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {getUserRoleDisplayName(post.user.role)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{formattedTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ReportForm
              type="post"
              targetId={post.id}
              targetAuthor={post.user.name}
              existingReport={myPostReport || undefined}
              onReportChange={refetchPostReports}
            />
            {isPostOwner && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  منشورك
                </Badge>
                <DropdownMenu
                  items={createEditDeleteItems(
                    () => setShowEditDialog(true),
                    () => setShowDeleteDialog(true)
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm leading-relaxed mb-3">{post.statement}</p>
        {post.image && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt="Post image"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
             {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleLike}
              disabled={!isAuthenticated}
              aria-label={`${isLiked ? 'إلغاء الإعجاب' : 'إعجاب'} بالمنشور`}
              className={cn("flex items-center gap-2", {
                "text-red-500 hover:text-red-600": isLiked,
                "text-muted-foreground hover:text-foreground": !isLiked,
              })}
            >
              {/* أيقونة القلب هنا */}
              <span className="text-sm">{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              aria-label={`${showComments ? "إخفاء" : "عرض"} التعليقات - ${comments.length} تعليق`}
              aria-expanded={showComments}
              className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{comments.length}</span>
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showComments && (
          <div className="w-full space-y-3">
            <Separator />

            {/* Add Comment */}
            {isAuthenticated ? (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "م"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="اكتب تعليقاً..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none"
                    aria-label="اكتب تعليقاً على هذا المنشور"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                  >
                    {isSubmittingComment ? "جاري الإرسال..." : "تعليق"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  سجل دخول لتتمكن من إضافة تعليق
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" asChild>
                    <Link to="/login">تسجيل دخول</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/register">حساب جديد</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentComponent 
                    key={comment.id} 
                    comment={comment}
                    onCommentUpdate={(updated) => {
                      setComments(prev => 
                        prev.map(c => c.id === updated.id ? updated : c)
                      );
                    }}
                    onCommentDelete={(commentId) => {
                      setComments(prev => prev.filter(c => c.id !== commentId));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardFooter>

      {/* Edit Post Dialog */}
      <EditPostDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        post={post}
        onSave={handleEditPost}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="حذف المنشور"
        description="هل أنت متأكد من رغبتك في حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDeletePost}
        isLoading={isDeleting}
      />
    </Card>
  );
});

interface CommentComponentProps {
  comment: Comment;
  onCommentUpdate?: (updatedComment: Comment) => void;
  onCommentDelete?: (commentId: number) => void;
}

function CommentComponent({ comment, onCommentUpdate, onCommentDelete }: CommentComponentProps) {
  const { isAuthenticated, user } = useAuthContext();
  const [showReplies, setShowReplies] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New hooks for reports
  const { data: commentReports, refetch: refetchCommentReports } = useCommentReports(comment.id);
  const myCommentReport = useMemo(() => {
    return commentReports?.find(report => report.user.id === user?.id);
  }, [commentReports, user]);

  const isCommentOwner = user?.id === comment.user.id;

  const handleAddReply = async () => {
    if (!newReply.trim()) return;

    setIsSubmittingReply(true);
    setError(null);
    try {
      const reply = await postsApiService.createReply({
        reply: newReply,
        comment: comment.id,
      });

      setReplies((prev) => [...prev, reply]);
      setNewReply("");
    } catch (error) {
      console.error("Error adding reply:", error);
      setError(formatError(error));
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditComment = async (updatedComment: Comment) => {
    try {
      if (onCommentUpdate) {
        onCommentUpdate(updatedComment);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('فشل في تعديل التعليق. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDeleteComment = async () => {
    setIsDeleting(true);
    try {
      await postsApiService.deleteComment(comment.id);
      
      if (onCommentDelete) {
        onCommentDelete(comment.id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(formatError(error));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReplyUpdate = (updatedReply: Reply) => {
    setReplies(prev => 
      prev.map(reply => 
        reply.id === updatedReply.id ? updatedReply : reply
      )
    );
  };

  const handleReplyDelete = (replyId: number) => {
    setReplies(prev => prev.filter(reply => reply.id !== replyId));
  };

  return (
    <div className="flex gap-3">
      <Link
        to={getProfileUrl(comment.user.id, comment.user.role)}
        className="hover:opacity-80 transition-opacity"
      >
        <Avatar className="h-8 w-8 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
          <AvatarImage src={comment.user.image} />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 space-y-2">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={getProfileUrl(comment.user.id, comment.user.role)}
              className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
            >
              {comment.user.name}
            </Link>
            {comment.user.is_verified && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                متحقق
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm">{comment.comment}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setShowReplies(!showReplies)}
            >
              رد ({replies.length})
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <ReportForm
              type="comment"
              targetId={comment.id}
              targetAuthor={comment.user.name}
              existingReport={myCommentReport || undefined}
              onReportChange={refetchCommentReports}
            />
            {isCommentOwner && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs px-1 py-0.5 bg-green-50 text-green-700 border-green-200">
                  تعليقك
                </Badge>
                <DropdownMenu
                  items={createEditDeleteItems(
                    () => setShowEditDialog(true),
                    () => setShowDeleteDialog(true)
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {showReplies && (
          <div className="space-y-2 pe-4 border-r-2 border-muted">
            {/* Add Reply */}
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs">
                    {user?.name?.charAt(0) || "م"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <Textarea
                    placeholder="اكتب رداً..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="min-h-[50px] resize-none text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddReply}
                    disabled={!newReply.trim() || isSubmittingReply}
                    className="h-7 text-xs"
                  >
                    {isSubmittingReply ? "جاري الإرسال..." : "رد"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  سجل دخول للرد على هذا التعليق
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    asChild
                  >
                    <Link to="/login">تسجيل دخول</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {replies.map((reply) => (
              <ReplyComponent
                key={reply.id}
                reply={reply}
                onReplyUpdate={handleReplyUpdate}
                onReplyDelete={handleReplyDelete}
              />
            ))}
          </div>
        )}

        <EditCommentDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          comment={comment}
          onSave={handleEditComment}
        />

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="حذف التعليق"
          description="هل أنت متأكد من رغبتك في حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={handleDeleteComment}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}

// Reply Component
interface ReplyComponentProps {
  reply: Reply;
  onReplyUpdate?: (updatedReply: Reply) => void;
  onReplyDelete?: (replyId: number) => void;
}

function ReplyComponent({ reply, onReplyUpdate, onReplyDelete }: ReplyComponentProps) {
  const { user } = useAuthContext();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New hooks for reports
  const { data: replyReports, refetch: refetchReplyReports } = useReplyReports(reply.id);
  const myReplyReport = useMemo(() => {
    return replyReports?.find(report => report.user.id === user?.id);
  }, [replyReports, user]);

  const isReplyOwner = user?.id === reply.user.id;

  const handleEditReply = async (updatedReply: Reply) => {
    try {
      await postsApiService.updateReply(reply.id, { reply: updatedReply.reply });
      if (onReplyUpdate) {
        onReplyUpdate(updatedReply);
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      setError(formatError(error));
    }
  };

  const handleDeleteReply = async () => {
    setIsDeleting(true);
    try {
      await postsApiService.deleteReply(reply.id);
      
      if (onReplyDelete) {
        onReplyDelete(reply.id);
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      setError(formatError(error));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Link
          to={getProfileUrl(reply.user.id, reply.user.role)}
          className="hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-6 w-6 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
            <AvatarImage src={reply.user.image} />
            <AvatarFallback className="text-xs">
              {reply.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 bg-muted/50 rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Link
                to={getProfileUrl(reply.user.id, reply.user.role)}
                className="text-xs font-medium hover:text-primary transition-colors cursor-pointer"
              >
                {reply.user.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(reply.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ReportForm
                type="reply-comment"
                targetId={reply.id}
                targetAuthor={reply.user.name}
                existingReport={myReplyReport || undefined}
                onReportChange={refetchReplyReports}
              />
              {isReplyOwner && (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-1 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                    ردك
                  </Badge>
                  <DropdownMenu
                    items={createEditDeleteItems(
                      () => setShowEditDialog(true),
                      () => setShowDeleteDialog(true)
                    )}
                  />
                </div>
              )}
            </div>
          </div>
          <p className="text-xs">{reply.reply}</p>
        </div>
      </div>
       {/* Error Display */}
       {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Edit Reply Dialog */}
      <EditCommentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        comment={reply as unknown as Comment}
        onSave={(updated) => handleEditReply(updated as unknown as Reply)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="حذف الرد"
        description="هل أنت متأكد من رغبتك في حذف هذا الرد؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDeleteReply}
        isLoading={isDeleting}
      />
    </>
  );
} 