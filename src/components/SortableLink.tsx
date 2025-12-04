import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GripVertical, Trash2, Link2, DollarSign, Tag, Play, Maximize2, Check, ImagePlus, Palette, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RevenueProgressBar } from './RevenueProgressBar';

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
  stripe_api_key?: string;
  lemonsqueezy_api_key?: string;
  lemonsqueezy_store_id?: string;
  live_revenue?: number;
  revenue_updated_at?: string;
}

const COLOR_OPTIONS = [
  { value: 'hsl(150, 80%, 35%)', label: 'Green' },
  { value: 'hsl(220, 80%, 50%)', label: 'Blue' },
  { value: 'hsl(280, 70%, 50%)', label: 'Purple' },
  { value: 'hsl(350, 80%, 55%)', label: 'Red' },
  { value: 'hsl(30, 90%, 55%)', label: 'Orange' },
  { value: 'hsl(180, 70%, 40%)', label: 'Teal' },
  { value: 'hsl(45, 90%, 50%)', label: 'Yellow' },
  { value: 'hsl(330, 70%, 55%)', label: 'Pink' },
  { value: 'hsl(0, 0%, 25%)', label: 'Dark' },
  { value: 'hsl(260, 70%, 60%)', label: 'Indigo' },
  { value: 'hsl(15, 85%, 50%)', label: 'Coral' },
  { value: 'hsl(165, 60%, 45%)', label: 'Mint' },
];

interface SortableLinkProps {
  link: CustomLink;
  onUpdate: (id: string, field: keyof CustomLink, value: string | number | null) => void;
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
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(link.url);
  const [uploading, setUploading] = useState(false);
  const [fetchingRevenue, setFetchingRevenue] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revenue connection states
  const [revenueTab, setRevenueTab] = useState<'stripe' | 'lemonsqueezy'>('stripe');
  const [stripeApiKey, setStripeApiKey] = useState('');
  const [lemonSqueezyApiKey, setLemonSqueezyApiKey] = useState('');
  const [lemonSqueezyStoreId, setLemonSqueezyStoreId] = useState('');

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

  const fetchRevenue = async (provider: 'stripe' | 'lemonsqueezy') => {
    setFetchingRevenue(true);
    try {
      const body: Record<string, string> = {
        linkId: link.id,
        provider,
      };

      if (provider === 'stripe') {
        if (!stripeApiKey) {
          toast.error('Please enter your Stripe API key');
          return;
        }
        body.apiKey = stripeApiKey;
      } else {
        if (!lemonSqueezyApiKey || !lemonSqueezyStoreId) {
          toast.error('Please enter both API key and Store ID');
          return;
        }
        body.apiKey = lemonSqueezyApiKey;
        body.storeId = lemonSqueezyStoreId;
      }

      const { data, error } = await supabase.functions.invoke('fetch-revenue', {
        body,
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Revenue fetched: $${data.revenue.toLocaleString()}`);
        onUpdate(link.id, 'live_revenue', data.revenue);
        onSave({ ...link, live_revenue: data.revenue });
        setRevenueDialogOpen(false);
        setStripeApiKey('');
        setLemonSqueezyApiKey('');
        setLemonSqueezyStoreId('');
      } else {
        toast.error(data.error || 'Failed to fetch revenue');
      }
    } catch (error: any) {
      console.error('Revenue fetch error:', error);
      toast.error(error.message || 'Failed to fetch revenue');
    } finally {
      setFetchingRevenue(false);
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

  const handleColorChange = (color: string) => {
    onUpdate(link.id, 'color', color);
    onSave({ ...link, color });
    setColorOpen(false);
  };

  const hasRevenue = link.live_revenue !== null && link.live_revenue !== undefined;

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
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity relative group"
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
            className="text-base font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 mb-1 placeholder:text-muted-foreground/50"
          />
          <Input
            value={link.url}
            onChange={(e) => {
              onUpdate(link.id, 'url', e.target.value);
              onSave({ ...link, url: e.target.value });
            }}
            placeholder="Description or tagline..."
            className="text-sm text-muted-foreground bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
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
                className="placeholder:text-muted-foreground/50"
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

        {/* Revenue - Stripe/LemonSqueezy Dialog */}
        <Dialog open={revenueDialogOpen} onOpenChange={setRevenueDialogOpen}>
          <DialogTrigger asChild>
            <button className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              hasRevenue ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}>
              <DollarSign className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Revenue Source</DialogTitle>
            </DialogHeader>

            {hasRevenue && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">Current MRR</p>
                <p className="text-2xl font-bold">${link.live_revenue?.toLocaleString()}</p>
                {link.revenue_updated_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {new Date(link.revenue_updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Tab buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setRevenueTab('stripe')}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors",
                  revenueTab === 'stripe'
                    ? "bg-[hsl(260,80%,60%)] text-white"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                Connect with <span className="font-bold">stripe</span>
              </button>
              <button
                onClick={() => setRevenueTab('lemonsqueezy')}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors",
                  revenueTab === 'lemonsqueezy'
                    ? "bg-[hsl(45,90%,50%)] text-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                Connect with 🍋 <span className="font-bold">lemon squeezy</span>
              </button>
            </div>

            {revenueTab === 'stripe' ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>1. <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary underline">Generate a Stripe Restricted API key</a> with read-only access.</p>
                  <p>2. Click [Create Key] at the bottom right of the Stripe page</p>
                  <p>3. Copy the new API key and paste it below</p>
                </div>
                <Input
                  value={stripeApiKey}
                  onChange={(e) => setStripeApiKey(e.target.value)}
                  placeholder="rk_live_..."
                  type="password"
                  className="font-mono text-sm placeholder:text-muted-foreground/50 bg-white"
                />
                <button
                  onClick={() => fetchRevenue('stripe')}
                  disabled={fetchingRevenue || !stripeApiKey}
                  className="w-full h-11 bg-[hsl(330,80%,55%)] hover:bg-[hsl(330,80%,50%)] text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {fetchingRevenue ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  FETCH STRIPE REVENUE
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>1. <a href="https://app.lemonsqueezy.com/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">Generate a new API key</a></p>
                  <p>2. <a href="https://app.lemonsqueezy.com/settings/stores" target="_blank" rel="noopener noreferrer" className="text-primary underline">Find your store ID</a></p>
                  <p>3. Paste the API key and store ID below</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">API Key</label>
                    <Input
                      value={lemonSqueezyApiKey}
                      onChange={(e) => setLemonSqueezyApiKey(e.target.value)}
                      placeholder="Enter your API Key"
                      type="password"
                      className="placeholder:text-muted-foreground/50 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Store ID</label>
                    <Input
                      value={lemonSqueezyStoreId}
                      onChange={(e) => setLemonSqueezyStoreId(e.target.value)}
                      placeholder="Enter your Store ID"
                      className="placeholder:text-muted-foreground/50 bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={() => fetchRevenue('lemonsqueezy')}
                  disabled={fetchingRevenue || !lemonSqueezyApiKey || !lemonSqueezyStoreId}
                  className="w-full h-11 bg-[hsl(330,80%,55%)] hover:bg-[hsl(330,80%,50%)] text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {fetchingRevenue ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  FETCH LEMONSQUEEZY REVENUE
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>

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

        {/* Color */}
        <Popover open={colorOpen} onOpenChange={setColorOpen}>
          <PopoverTrigger asChild>
            <button 
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border border-border"
              style={{ backgroundColor: link.color || 'hsl(150, 80%, 35%)' }}
            >
              <Palette className="w-4 h-4 text-white" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground px-2 py-1">Button color</p>
              <div className="grid grid-cols-4 gap-2 p-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-lg transition-all",
                      link.color === color.value && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
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

      {/* Revenue Progress Bar */}
      {hasRevenue && (
        <div className="px-4 pb-4 ml-9">
          <RevenueProgressBar 
            revenue={link.live_revenue!} 
            color={link.color}
            showMilestones
          />
        </div>
      )}
    </div>
  );
}
