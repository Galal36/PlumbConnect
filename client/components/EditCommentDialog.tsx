import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Comment } from "@/types";
import { postsApiService } from "@/services/postsApi";
import { formatError } from "@/utils";

interface EditCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment: Comment;
  onSave: (updatedComment: Comment) => void;
}

export default function EditCommentDialog({
  open,
  onOpenChange,
  comment,
  onSave,
}: EditCommentDialogProps) {
  // Support both Comment (comment) and Reply (reply) shapes
  const originalText = (comment as any)?.comment ?? (comment as any)?.reply ?? "";
  const [commentText, setCommentText] = useState<string>(originalText);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = (commentText || "").trim();
    if (!trimmed) {
      setError("لا يمكن أن يكون التعليق فارغاً");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If it's a reply shape, update reply; otherwise update comment
      const isReply = (comment as any)?.reply !== undefined;
      let updated: any;
      if (isReply) {
        updated = await postsApiService.updateReply(comment.id, { reply: trimmed });
      } else {
        updated = await postsApiService.updateComment(comment.id, { comment: trimmed });
      }

      onSave(updated as Comment);
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating comment:", err);
      setError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCommentText(originalText);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل التعليق</DialogTitle>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">التعليق</Label>
            <Textarea
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[80px] resize-none text-end"
              placeholder="اكتب تعليقك هنا..."
              dir="rtl"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isLoading || !(commentText || "").trim() || (commentText === originalText)
              }
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 