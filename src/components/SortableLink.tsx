import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GripVertical, Trash2, Link2, DollarSign, Tag, Play, Maximize2, Check, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
interface CustomLink {
  id: string;
  title: string;
  url: string;
  position: number;
  status?: string;
  category?: string;
  icon?: string;
  size?: string;
}

interface SortableLinkProps {
  link: CustomLink;
  onUpdate: (id: string, field: keyof CustomLink, value: string) => void;
  onSave: (link: CustomLink) => void;
  onDelete: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'building', label: 'Building...', icon: '🏗️' },
  { value: 'active', label: 'Active', icon: '🟢' },
  { value: 'on-hold', label: 'On hold', icon: '☕' },
  { value: 'for-sale', label: 'For Sale', icon: '💎' },
  { value: 'acquired', label: 'Acquired', icon: '💰' },
  { value: 'discontinued', label: 'Discontinued', icon: '❌' },
];

const CATEGORY_OPTIONS = [
  { value: 'saas', label: 'SaaS' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'community', label: 'Community' },
  { value: 'agency', label: 'Agency' },
  { value: 'other', label: 'Other' },
];

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export function SortableLink({ link, onUpdate, onSave, onDelete }: SortableLinkProps) {
  const [enabled, setEnabled] = useState(true);
  const [urlOpen, setUrlOpen] = useState(false);
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(link.url);
  const [tempRevenue, setTempRevenue] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImageUrl = (icon?: string) => icon?.startsWith('http') || icon?.startsWith('data:');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${link.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('link-icons')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('link-icons')
        .getPublicUrl(fileName);

      onUpdate(link.id, 'icon', publicUrl);
      onSave({ ...link, icon: publicUrl });
      toast.success('Logo uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

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

  const currentStatus = STATUS_OPTIONS.find(s => s.value === link.status) || STATUS_OPTIONS[1];

  const handleSaveUrl = () => {
    onUpdate(link.id, 'url', tempUrl);
    onSave({ ...link, url: tempUrl });
    setUrlOpen(false);
  };

  const handleStatusChange = (status: string) => {
    onUpdate(link.id, 'status', status);
    onSave({ ...link, status });
    setStatusOpen(false);
  };

  const handleCategoryChange = (category: string) => {
    onUpdate(link.id, 'category', category);
    onSave({ ...link, category });
    setCategoryOpen(false);
  };

  const handleSizeChange = (size: string) => {
    onUpdate(link.id, 'size', size);
    onSave({ ...link, size });
    setSizeOpen(false);
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
        
        {/* Link Icon with upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-400 to-green-600 flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity relative group"
          disabled={uploading}
        >
          {isImageUrl(link.icon) ? (
            <img src={link.icon} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">{link.icon || '🚀'}</span>
          )}
          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ImagePlus className="w-5 h-5 text-background" />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
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
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-4 pb-4 ml-9">
        {/* URL Link */}
        <Popover open={urlOpen} onOpenChange={setUrlOpen}>
          <PopoverTrigger asChild>
            <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Link2 className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <div className="space-y-3">
              <label className="text-sm font-medium">Project URL</label>
              <Input
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://myproject.com"
              />
              <button
                onClick={handleSaveUrl}
                className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg"
              >
                Save
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Revenue */}
        <Popover open={revenueOpen} onOpenChange={setRevenueOpen}>
          <PopoverTrigger asChild>
            <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <DollarSign className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <div className="space-y-3">
              <label className="text-sm font-medium">Monthly Revenue</label>
              <Input
                value={tempRevenue}
                onChange={(e) => setTempRevenue(e.target.value)}
                placeholder="$1,000/mo"
              />
              <button
                onClick={() => setRevenueOpen(false)}
                className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg"
              >
                Save
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Category */}
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Tag className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground px-2 py-1">Pick one</p>
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors",
                    link.category === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  {link.category === cat.value && <Check className="w-4 h-4" />}
                  {cat.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Status */}
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <button className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground transition-colors">
              <Play className="w-4 h-4 fill-current" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground px-2 py-1">Pick one</p>
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors",
                    link.status === status.value
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  <span>{status.icon}</span>
                  {status.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Size */}
        <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
          <PopoverTrigger asChild>
            <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground px-2 py-1">Widget size</p>
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleSizeChange(size.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors",
                    link.size === size.value
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  {link.size === size.value && <Check className="w-4 h-4" />}
                  {size.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Delete */}
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