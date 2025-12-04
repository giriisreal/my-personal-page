import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Tablet, Smartphone, Copy, Plus, GripVertical, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  location?: string | null;
  revenue?: string | null;
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
  position: number;
  status?: string;
  category?: string;
  icon?: string;
  size?: string;
  color?: string;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';

interface BentoEditorProps {
  profile: Profile;
  customLinks: CustomLink[];
  onLinksChange: (links: CustomLink[]) => void;
  onAddLink: () => void;
  onUpdateLink: (id: string, field: keyof CustomLink, value: string) => void;
  onSaveLink: (link: CustomLink) => void;
  onDeleteLink: (id: string) => void;
}

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small', cols: 1 },
  { value: 'medium', label: 'Medium', cols: 1 },
  { value: 'large', label: 'Large', cols: 2 },
];

const COLOR_OPTIONS = [
  { value: 'default', label: 'Default', class: 'bg-secondary' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-100' },
  { value: 'green', label: 'Green', class: 'bg-green-100' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-100' },
  { value: 'red', label: 'Red', class: 'bg-red-100' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-100' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-100' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-100' },
];

function BentoCard({ 
  link, 
  onUpdate, 
  onSave,
  onDelete 
}: { 
  link: CustomLink; 
  onUpdate: (id: string, field: keyof CustomLink, value: string) => void;
  onSave: (link: CustomLink) => void;
  onDelete: (id: string) => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
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
  };

  const isImageUrl = (icon?: string) => icon?.startsWith('http') || icon?.startsWith('data:');
  
  const getColorClass = (color?: string) => {
    const colorOption = COLOR_OPTIONS.find(c => c.value === color);
    return colorOption?.class || 'bg-secondary';
  };

  const getSizeClass = (size?: string) => {
    switch (size) {
      case 'large': return 'col-span-2 row-span-2';
      case 'small': return 'col-span-1 row-span-1';
      default: return 'col-span-1 row-span-1';
    }
  };

  const handleColorChange = (color: string) => {
    onUpdate(link.id, 'color', color);
    onSave({ ...link, color });
  };

  const handleSizeChange = (size: string) => {
    onUpdate(link.id, 'size', size);
    onSave({ ...link, size });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-2xl p-4 transition-all duration-200 cursor-pointer",
        getColorClass(link.color),
        getSizeClass(link.size),
        isDragging ? "opacity-50 scale-105 z-50" : "hover:shadow-lg"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Settings Button */}
      <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
        <PopoverTrigger asChild>
          <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background">
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input
              value={link.title}
              onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
              onBlur={() => onSave(link)}
              placeholder="Link title"
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">URL</label>
            <Input
              value={link.url}
              onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
              onBlur={() => onSave(link)}
              placeholder="https://..."
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Size</label>
            <div className="flex gap-1">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleSizeChange(size.value)}
                  className={cn(
                    "flex-1 px-2 py-1.5 text-xs rounded-lg transition-colors",
                    link.size === size.value 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Color</label>
            <div className="grid grid-cols-4 gap-1.5">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={cn(
                    "w-full h-8 rounded-lg transition-all",
                    color.class,
                    link.color === color.value && "ring-2 ring-primary ring-offset-2"
                  )}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDelete(link.id)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </Button>
        </PopoverContent>
      </Popover>

      {/* Card Content */}
      <div className="flex flex-col h-full min-h-[100px]">
        {/* Icon */}
        <div className="mb-2">
          {isImageUrl(link.icon) ? (
            <img src={link.icon} alt="" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <span className="text-2xl">{link.icon || '🚀'}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground text-sm line-clamp-2">
          {link.title || 'Untitled'}
        </h3>

        {/* URL Domain */}
        {link.url && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {link.url.replace(/^https?:\/\//, '').split('/')[0]}
          </p>
        )}
      </div>
    </div>
  );
}

export function BentoEditor({
  profile,
  customLinks,
  onLinksChange,
  onAddLink,
  onUpdateLink,
  onSaveLink,
  onDeleteLink,
}: BentoEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = customLinks.findIndex((link) => link.id === active.id);
    const newIndex = customLinks.findIndex((link) => link.id === over.id);
    const newLinks = arrayMove(customLinks, oldIndex, newIndex);
    onLinksChange(newLinks);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const getGridClass = () => {
    switch (viewMode) {
      case 'mobile': return 'grid-cols-2 max-w-[360px]';
      case 'tablet': return 'grid-cols-3 max-w-[600px]';
      default: return 'grid-cols-4 max-w-[900px]';
    }
  };

  const getContainerClass = () => {
    switch (viewMode) {
      case 'mobile': return 'w-[360px] min-h-[640px]';
      case 'tablet': return 'w-[600px] min-h-[500px]';
      default: return 'w-full min-h-[500px]';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Canvas */}
      <div className="flex-1 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-2xl p-6 overflow-auto">
        <div className={cn(
          "bg-background rounded-2xl shadow-2xl mx-auto transition-all duration-300 p-6",
          getContainerClass()
        )}>
          {/* Profile Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl overflow-hidden ring-4 ring-background shadow-lg">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.display_name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {profile.display_name || profile.username}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.bio || 'No bio yet...'}
              </p>
            </div>
          </div>

          {/* Bento Grid */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={customLinks.map(link => link.id)}
              strategy={rectSortingStrategy}
            >
              <div className={cn("grid gap-3 auto-rows-[120px]", getGridClass())}>
                {customLinks.map((link) => (
                  <BentoCard
                    key={link.id}
                    link={link}
                    onUpdate={onUpdateLink}
                    onSave={onSaveLink}
                    onDelete={onDeleteLink}
                  />
                ))}
                
                {/* Add New Card */}
                <button
                  onClick={onAddLink}
                  className="rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[120px]"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-xs font-medium">Add Block</span>
                </button>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-center gap-3 mt-4 pb-2">
        <Button
          onClick={copyLink}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy my Link
        </Button>

        <div className="flex items-center bg-secondary rounded-lg p-1">
          <button
            onClick={() => setViewMode('desktop')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              viewMode === 'desktop' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              viewMode === 'tablet' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Tablet className="w-4 h-4" />
            Tablet
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              viewMode === 'mobile' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>
      </div>
    </div>
  );
}
