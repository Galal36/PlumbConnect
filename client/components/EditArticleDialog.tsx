import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Image as ImageIcon } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Article } from "@/services/realApi";

interface EditArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: {
    id: string;
    title: string;
    description: string;
  };
  onSave: (updatedArticle: { id: string; title: string; description: string }) => void;
}

export default function EditArticleDialog({
  open,
  onOpenChange,
  article,
  onSave,
}: EditArticleDialogProps) {
  const [articleData, setArticleData] = useState({
    title: article.title,
    description: article.description,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!articleData.title.trim() || !articleData.description.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedArticle = {
        id: article.id,
        title: articleData.title.trim(),
        description: articleData.description.trim(),
      };

      onSave(updatedArticle);
      onOpenChange(false);
    } catch (error) {
      setError("فشل في تحديث المقال. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setArticleData({
      title: article.title,
      description: article.description,
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المقال</DialogTitle>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-article-title">عنوان المقال</Label>
            <Input
              id="edit-article-title"
              value={articleData.title}
              onChange={(e) =>
                setArticleData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="text-end"
              dir="rtl"
              disabled={isLoading}
              placeholder="اكتب عنوان المقال هنا..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-article-description">وصف مختصر للمقال</Label>
            <Textarea
              id="edit-article-description"
              value={articleData.description}
              onChange={(e) =>
                setArticleData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="text-end resize-none min-h-[100px]"
              dir="rtl"
              disabled={isLoading}
              placeholder="اكتب وصفاً مختصراً للمقال..."
            />
          </div>

          <DialogFooter className="flex flex-row-reverse gap-2">
            <Button
              onClick={handleSave}
              disabled={
                isLoading ||
                !articleData.title.trim() ||
                !articleData.description.trim()
              }
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
