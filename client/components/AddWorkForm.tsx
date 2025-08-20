import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Plus, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

import { Experience } from "@/services/api";

interface Work {
  id: string;
  title: string;
  description: string;
  images: string[];
  date: string;
}

interface AddWorkFormProps {
  onClose: () => void;
  onAddWork: (work: Omit<Work, "id">) => void;
}

export default function AddWorkForm({ onClose, onAddWork }: AddWorkFormProps) {
  const [workData, setWorkData] = useState({
    title: "",
    description: "",
    images: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workData.title.trim() || !workData.description.trim()) return;

    const newWork = {
      ...workData,
      date: new Date().toISOString().split("T")[0],
      userId: "", // Will be set by parent component
      userName: "", // Will be set by parent component
    };

    // Add the work to the list
    onAddWork(newWork);

    // Show success message
    alert("تم إضافة العمل بنجاح!");

    // Reset form and close
    setWorkData({ title: "", description: "", images: [] });
    onClose();
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
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان العمل</Label>
        <Input
          id="title"
          value={workData.title}
          onChange={(e) =>
            setWorkData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="مثال: إصلاح تسريب في المطبخ"
          className="text-end"
          dir="rtl"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف العمل</Label>
        <Textarea
          id="description"
          value={workData.description}
          onChange={(e) =>
            setWorkData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="اكتب وصفاً مفصلاً للعمل الذي قمت به، المشاكل التي واجهتها، والحلول التي طبقتها..."
          className="text-end resize-none min-h-[100px]"
          dir="rtl"
          required
        />
        <p className="text-sm text-gray-500">
          {workData.description.length}/500 حرف
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">صور العمل (اختياري)</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="images"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">اضغط لرفع الصور</span>
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG أو JPEG (حد أقصى 4 صور)
                </p>
              </div>
              <input
                id="images"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
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
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
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
          type="submit"
          disabled={!workData.title.trim() || !workData.description.trim()}
        >
          <Plus className="h-4 w-4 ms-2" />
          إضافة العمل
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
      </DialogFooter>
    </form>
  );
}
