import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DropdownMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  className?: string;
}

export default function DropdownMenu({ items, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (item: DropdownMenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="المزيد من الخيارات"
        className="hover:bg-gray-100 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200 rounded-md"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 w-48 bg-background border rounded-md shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'w-full text-right px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors',
                  item.variant === 'destructive' && 'text-destructive hover:bg-destructive/10'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable edit/delete menu items
export const createEditDeleteItems = (
  onEdit: () => void,
  onDelete: () => void,
  showEdit: boolean = true,
  showDelete: boolean = true
): DropdownMenuItem[] => {
  const items: DropdownMenuItem[] = [];

  if (showEdit) {
    items.push({
      label: 'تعديل',
      icon: <Edit className="h-4 w-4" />,
      onClick: onEdit,
    });
  }

  if (showDelete) {
    items.push({
      label: 'حذف',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'destructive',
    });
  }

  return items;
};
