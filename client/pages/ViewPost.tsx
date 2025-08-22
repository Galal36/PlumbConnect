import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Clock,
  Reply,
  Send,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import ReportForm from "@/components/ReportForm";
import { formatTimeAgo, getAvatarInitials, formatError, getProfileUrl } from "@/utils";
import { usePost, useCreateComment, useCreateReply } from "@/hooks/useApi";
import { LoadingSpinner } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/contexts/AuthContext";
import type { Post, Comment, Reply as ReplyType } from "@/types";

// Helper component for rendering a single comment and its replies
interface CommentComponentProps {
  comment: Comment;
}

function CommentComponent({ comment }: CommentComponentProps) {
  const { user } = useAuthContext();
  const [showReplies, setShowReplies] = useState(false);
  const [newReply, setNewReply] = useState("");
  const { createReply, loading: isSubmittingReply, error: replyError } = useCreateReply();
  const [replies, setReplies] = useState<ReplyType[]>(comment.replies || []);

  const handleAddReply = async () => {
    if (!newReply.trim()) return;
    try {
      const reply = await createReply({
        reply: newReply,
        comment: comment.id,
      });
      if (reply) {
        setReplies((prev) => [...prev, reply]);
        setNewReply("");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  return (
    <div className="flex gap-3">
      <Link
        to={getProfileUrl(comment.user.id, comment.user.role)}
        className="hover:opacity-80 transition-opacity"
      >
        <Avatar className="w-10 h-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
          <AvatarImage src={comment.user.image} />
          <AvatarFallback>{getAvatarInitials(comment.user.name)}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Link
                to={getProfileUrl(comment.user.id, comment.user.role)}
                className="font-semibold text-white text-sm hover:text-primary transition-colors"
              >
                {comment.user.name}
              </Link>
              {comment.user.role === "plumber" && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary text-xs"
                >
                  مختص فني صحي
                </Badge>
              )}
              <span className="text-xs text-gray-400">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            <ReportForm
              type="comment"
              targetId={comment.id}
              targetAuthor={comment.user.name}
            />
          </div>
          <p className="text-gray-300 text-sm">{comment.comment}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors text-sm"
          >
            <Reply className="h-4 w-4" />
            <span>رد ({replies.length})</span>
          </button>
        </div>

        {showReplies && (
          <div className="mt-4 space-y-3">
            {replyError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formatError(replyError)}</AlertDescription>
              </Alert>
            )}
            {user && (
              <div className="flex gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.image} />
                  <AvatarFallback>{getAvatarInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="اكتب ردك..."
                    className="text-end resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={handleAddReply}
                      disabled={!newReply.trim() || isSubmittingReply}
                    >
                      {isSubmittingReply ? "جاري الإرسال..." : "رد"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {replies.length > 0 &&
              replies.map((reply) => (
                <div key={reply.id} className="flex gap-2">
                  <Link
                    to={getProfileUrl(reply.user.id, reply.user.role)}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
                      <AvatarImage src={reply.user.image} />
                      <AvatarFallback>{getAvatarInitials(reply.user.name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={getProfileUrl(reply.user.id, reply.user.role)}
                          className="font-semibold text-white text-sm hover:text-primary transition-colors"
                        >
                          {reply.user.name}
                        </Link>
                        {reply.user.role === "plumber" && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary text-xs"
                          >
                            مختص فني صحي
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{reply.reply}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {/* Report flag hidden as requested */}
                      {/* <ReportForm
                        type="reply-comment"
                        targetId={reply.id}
                        targetAuthor={reply.user.name}
                      /> */}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ViewPost() {
  const { id } = useParams<{ id: string }>();
  const postId = id ? parseInt(id) : null;
  const { user } = useAuthContext();
  const [newComment, setNewComment] = useState("");
  const {
    data: post,
    loading,
    error,
  } = usePost(postId as number);
  const { createComment, loading: isSubmittingComment, error: commentError } = useCreateComment();

  // Handle case where post is not found or URL parameter is invalid
  if (!postId || isNaN(postId)) {
    return (
      <MainLayout className="bg-gray-900 flex justify-center items-center h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            هذا المنشور غير موجود.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <MainLayout className="bg-gray-900 flex justify-center items-center h-screen">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <MainLayout className="bg-gray-900 flex justify-center items-center h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            حدث خطأ أثناء تحميل المنشور: {formatError(error)}
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  // Handle successful data fetch
  if (!post) {
    return (
      <MainLayout className="bg-gray-900 flex justify-center items-center h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            عفواً، لم يتم العثور على هذا المنشور.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await createComment({
        comment: newComment,
        post: post.id,
      });

      if (comment) {
        // Here you would need a way to update the parent post's comment count,
        // but for now, we'll just log success.
        console.log("Comment added:", comment);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <MainLayout className="bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/posts">← العودة للبوستات</Link>
          </Button>
        </div>

        {/* Post */}
        <Card className="premium-card-gradient mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <Link to={`/profile/${post.user.id}`}>
                  <Avatar className="w-12 h-12 hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer">
                    <AvatarImage src={post.user.image} />
                    <AvatarFallback>{getAvatarInitials(post.user.name)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/${post.user.id}`}
                      className="font-semibold text-white hover:text-primary transition-colors"
                    >
                      {post.user.name}
                    </Link>
                    {post.user.role === "plumber" && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary text-xs"
                      >
                        مختص فني صحي
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(post.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Report flag hidden as requested */}
                {/* <ReportForm
                  type="post"
                  targetId={post.id}
                  targetAuthor={post.user.name}
                /> */}
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 leading-relaxed text-lg">
                {post.statement}
              </p>
            </div>

            {post.image && (
              <div className="mb-6">
                <img
                  src={post.image}
                  alt="صورة البوست"
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{post.comments_count} تعليق</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Comment */}
        <Card className="premium-card-gradient mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleAddComment}>
              <div className="flex gap-3">
                {user && (
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{getAvatarInitials(user.name)}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب تعليقك..."
                    className="text-end resize-none"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-400">
                      {newComment.length} حرف
                    </span>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      <Send className="h-4 w-4 ms-2" />
                      {isSubmittingComment ? "جاري الإرسال..." : "تعليق"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
            {commentError && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formatError(commentError)}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            التعليقات ({post.comments_count})
          </h3>
          {post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="text-center text-gray-400 mt-8">لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 