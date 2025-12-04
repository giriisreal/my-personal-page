import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Trash2, Link2, DollarSign, Tag, Flag, Maximize2 } from 'lucide-react';

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
  const [enabled, setEnabled] = useState(true);
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
      className="bg-card rounded-xl border border-border/50 overflow-hidden"
    >
      {/* Header with avatar and title */}
      <div className="flex items-start gap-4 p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        {/* Link Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🚀</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <Input
            value={link.title}
            onChange={(e) => {
              onUpdate(link.id, 'title', e.target.value);
              onSave({ ...link, title: e.target.value });
            }}
            placeholder="Startup name"
            className="text-base font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 mb-1"
          />
          <Input
            value={link.url}
            onChange={(e) => {
              onUpdate(link.id, 'url', e.target.value);
              onSave({ ...link, url: e.target.value });
            }}
            placeholder="Description or tagline..."
            className="text-sm text-muted-foreground bg-transparent border-none p-0 h-auto focus-visible:ring-0"
          />
        </div>

        <Switch 
          checked={enabled} 
          onCheckedChange={setEnabled}
          className="data-[state=checked]:bg-pink-500"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-4 pb-4 ml-9">
        <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Link2 className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <DollarSign className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Tag className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Flag className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(link.id)}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
