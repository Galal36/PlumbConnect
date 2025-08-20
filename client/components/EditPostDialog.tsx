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
import type { Post } from "@/types";
import { postsApiService } from "@/services/postsApi";
import { formatError } from "@/utils";

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  onSave: (updatedPost: Post) => void;
}

export default function EditPostDialog({
  open,
  onOpenChange,
  post,
  onSave,
}: EditPostDialogProps) {
  const [statement, setStatement] = useState(post.statement);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!statement.trim()) {
      setError("لا يمكن أن يكون المنشور فارغاً");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ✅ Actual API call to update the post
      const updatedPost = await postsApiService.updatePost(post.id, {
        statement: statement.trim(),
      });

      onSave(updatedPost);
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating post:", err);
      setError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStatement(post.statement);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المنشور</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="statement">المحتوى</Label>
            <Textarea
              id="statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="min-h-[120px] resize-none"
              placeholder="اكتب منشورك هنا..."
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
              disabled={isLoading || !statement.trim() || statement === post.statement}
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}