import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Save, Trash2 } from 'lucide-react';

interface CustomLink {
  id: string;
  title: string;
  url: string;
  position: number;
}

interface SortableLinkProps {
  link: CustomLink;
  onUpdate: (id: string, field: 'title' | 'url', value: string) => void;
  onSave: (link: CustomLink) => void;
  onDelete: (id: string) => void;
}

export function SortableLink({ link, onUpdate, onSave, onDelete }: SortableLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 grid grid-cols-2 gap-3">
        <Input
          value={link.title}
          onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
          placeholder="Link title"
        />
        <Input
          value={link.url}
          onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <Button variant="ghost" size="icon" onClick={() => onSave(link)}>
        <Save className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)}>
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
}
