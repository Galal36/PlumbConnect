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
import { AlertCircle } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface LocalExperience {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

interface EditExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience: LocalExperience;
  onSave: (updatedExperience: LocalExperience) => void;
}

export default function EditExperienceDialog({
  open,
  onOpenChange,
  experience,
  onSave,
}: EditExperienceDialogProps) {
  const [experienceData, setExperienceData] = useState({
    title: experience.title,
    description: experience.description,
    startDate: experience.startDate,
    endDate: experience.endDate || "",
    isCurrent: experience.isCurrent,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (
      !experienceData.title.trim() ||
      !experienceData.description.trim() ||
      !experienceData.startDate
    ) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!experienceData.isCurrent && !experienceData.endDate) {
      setError("يرجى تحديد تاريخ الانتهاء أو اختيار 'أعمل حالياً'");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedExperience: LocalExperience = {
        ...experience,
        title: experienceData.title.trim(),
        description: experienceData.description.trim(),
        startDate: experienceData.startDate,
        endDate: experienceData.isCurrent ? null : experienceData.endDate,
        isCurrent: experienceData.isCurrent,
      };

      onSave(updatedExperience);
      onOpenChange(false);
    } catch (error) {
      setError("فشل في تحديث الخبرة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setExperienceData({
      title: experience.title,
      description: experience.description,
      startDate: experience.startDate,
      endDate: experience.endDate || "",
      isCurrent: experience.isCurrent,
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل الخبرة المهنية</DialogTitle>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-exp-title">المسمى الوظيفي</Label>
            <Input
              id="edit-exp-title"
              value={experienceData.title}
              onChange={(e) =>
                setExperienceData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="text-end"
              dir="rtl"
              disabled={isLoading}
              placeholder="مثال: سباك أول - شركة المياه الكويتية"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-exp-description">وصف المهام والإنجازات</Label>
            <Textarea
              id="edit-exp-description"
              value={experienceData.description}
              onChange={(e) =>
                setExperienceData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="text-end resize-none min-h-[100px]"
              dir="rtl"
              disabled={isLoading}
              placeholder="اكتب وصفاً مفصلاً للمهام التي كنت تقوم بها والإنجازات التي حققتها..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-exp-start">تاريخ البداية</Label>
              <Input
                id="edit-exp-start"
                type="date"
                value={experienceData.startDate}
                onChange={(e) =>
                  setExperienceData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-exp-end">تاريخ الانتهاء</Label>
              <Input
                id="edit-exp-end"
                type="date"
                value={experienceData.endDate}
                onChange={(e) =>
                  setExperienceData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                disabled={isLoading || experienceData.isCurrent}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="edit-is-current"
              checked={experienceData.isCurrent}
              onCheckedChange={(checked) =>
                setExperienceData((prev) => ({
                  ...prev,
                  isCurrent: checked as boolean,
                  endDate: checked ? "" : prev.endDate,
                }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="edit-is-current" className="text-sm">
              أعمل حالياً في هذا المنصب
            </Label>
          </div>

          <DialogFooter className="flex flex-row-reverse gap-2">
            <Button
              onClick={handleSave}
              disabled={
                isLoading ||
                !experienceData.title.trim() ||
                !experienceData.description.trim()
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
