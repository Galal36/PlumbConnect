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

interface Work {
  id: string;
  title: string;
  description: string;
  images: string[];
  date: string;
}

interface EditWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  work: Work;
  onSave: (updatedWork: Work) => void;
}

export default function EditWorkDialog({
  open,
  onOpenChange,
  work,
  onSave,
}: EditWorkDialogProps) {
  const [workData, setWorkData] = useState({
    title: work.title,
    description: work.description,
    images: work.images,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!workData.title.trim() || !workData.description.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedWork: Work = {
        ...work,
        title: workData.title.trim(),
        description: workData.description.trim(),
        images: workData.images,
      };

      onSave(updatedWork);
      onOpenChange(false);
    } catch (error) {
      setError("فشل في تحديث العمل. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setWorkData({
      title: work.title,
      description: work.description,
      images: work.images,
    });
    setError(null);
    onOpenChange(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you'd upload these to a server and get URLs back
      // For demo, we'll just add placeholder URLs
      const newImages = Array.from(files).map(() => "/placeholder.svg");
      setWorkData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 4), // Max 4 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setWorkData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل العمل</DialogTitle>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-title">عنوان العمل</Label>
            <Input
              id="edit-title"
              value={workData.title}
              onChange={(e) =>
                setWorkData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="text-right"
              dir="rtl"
              style={{ textAlign: "right", direction: "rtl" }}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">وصف العمل</Label>
            <Textarea
              id="edit-description"
              value={workData.description}
              onChange={(e) =>
                setWorkData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="text-right resize-none min-h-[100px]"
              dir="rtl"
              style={{ textAlign: "right", direction: "rtl" }}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-images">صور العمل</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="edit-images"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="w-6 h-6 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">إضافة صور جديدة</p>
                  </div>
                  <input
                    id="edit-images"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                </label>
              </div>

              {workData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {workData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isLoading}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-row-reverse gap-2">
            <Button
              onClick={handleSave}
              disabled={
                isLoading ||
                !workData.title.trim() ||
                !workData.description.trim()
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
