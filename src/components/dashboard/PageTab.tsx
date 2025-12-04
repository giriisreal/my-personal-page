import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AvatarUpload } from '@/components/AvatarUpload';
import { SortableLink } from '@/components/SortableLink';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  MapPin, DollarSign, Mail, Twitter, Github, Instagram, 
  Linkedin, Youtube, Plus 
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface PageTabProps {
  profile: Profile;
  customLinks: CustomLink[];
  userId: string;
  onProfileChange: (profile: Profile) => void;
  onLinksChange: (links: CustomLink[]) => void;
  onAddLink: () => void;
  onUpdateLink: (id: string, field: keyof CustomLink, value: string) => void;
  onSaveLink: (link: CustomLink) => void;
  onDeleteLink: (id: string) => void;
  onAvatarUpload: (url: string) => void;
}

const socialIcons = [
  { id: 'twitter', icon: Twitter, field: 'twitter_url' as const, placeholder: 'https://twitter.com/username' },
  { id: 'github', icon: Github, field: 'github_url' as const, placeholder: 'https://github.com/username' },
  { id: 'instagram', icon: Instagram, field: 'instagram_url' as const, placeholder: 'https://instagram.com/username' },
  { id: 'linkedin', icon: Linkedin, field: 'linkedin_url' as const, placeholder: 'https://linkedin.com/in/username' },
  { id: 'youtube', icon: Youtube, field: 'website_url' as const, placeholder: 'https://youtube.com/@channel' },
  { id: 'mail', icon: Mail, field: 'website_url' as const, placeholder: 'mailto:email@example.com' },
];

export function PageTab({
  profile,
  customLinks,
  userId,
  onProfileChange,
  onLinksChange,
  onAddLink,
  onUpdateLink,
  onSaveLink,
  onDeleteLink,
  onAvatarUpload,
}: PageTabProps) {
  const [activeSocial, setActiveSocial] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = customLinks.findIndex((link) => link.id === active.id);
    const newIndex = customLinks.findIndex((link) => link.id === over.id);
    const newLinks = arrayMove(customLinks, oldIndex, newIndex);
    onLinksChange(newLinks);
  };

  const activeSocialData = socialIcons.find(s => s.id === activeSocial);

  return (
    <div className="space-y-8">
      {/* Profile Info */}
      <div className="flex items-start gap-6">
        <AvatarUpload
          userId={userId}
          currentAvatarUrl={profile.avatar_url}
          displayName={profile.display_name}
          username={profile.username}
          onUpload={onAvatarUpload}
        />
        <div className="flex-1 space-y-4">
          <Input
            value={profile.display_name || ''}
            onChange={(e) => onProfileChange({ ...profile, display_name: e.target.value })}
            placeholder="Your name"
            className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
          />
          <Textarea
            value={profile.bio || ''}
            onChange={(e) => onProfileChange({ ...profile, bio: e.target.value })}
            placeholder="Just a young nerd who cannot fix his mind between finance and tech"
            className="min-h-[80px] resize-none border-2 border-primary/30 rounded-xl p-3 focus:border-primary focus-visible:ring-0 text-muted-foreground"
            rows={3}
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <a href="#" className="text-sm hover:text-foreground transition-colors">Markdown guide</a>
        <span className="text-xs">↗</span>
      </div>

      {/* Location, Revenue, Contact icons */}
      <div className="flex items-center gap-3 border-t border-border/50 pt-6">
        {/* Location */}
        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
          <PopoverTrigger asChild>
            <button className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
              profile.location ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}>
              <MapPin className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={profile.location || ''}
                onChange={(e) => onProfileChange({ ...profile, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Revenue */}
        <Popover open={revenueOpen} onOpenChange={setRevenueOpen}>
          <PopoverTrigger asChild>
            <button className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
              profile.revenue ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}>
              <DollarSign className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <label className="text-sm font-medium">Monthly Revenue</label>
              <Input
                value={profile.revenue || ''}
                onChange={(e) => onProfileChange({ ...profile, revenue: e.target.value })}
                placeholder="$5k/mo"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Contact Email */}
        <Popover open={emailOpen} onOpenChange={setEmailOpen}>
          <PopoverTrigger asChild>
            <button className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <label className="text-sm font-medium">Contact Email</label>
              <Input
                type="email"
                placeholder="you@email.com"
              />
              <p className="text-xs text-muted-foreground">
                Enable email subscriptions for your profile visitors
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Add Startup Button */}
      <Button 
        onClick={onAddLink}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
      >
        <Plus className="w-5 h-5 mr-2" />
        ADD STARTUP
      </Button>

      {/* Custom Links */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={customLinks.map(link => link.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {customLinks.map((link) => (
              <SortableLink
                key={link.id}
                link={link}
                onUpdate={onUpdateLink}
                onSave={onSaveLink}
                onDelete={onDeleteLink}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Social Links */}
      <div className="border-t border-border/50 pt-6 space-y-4">
        <div className="flex items-center gap-2">
          {socialIcons.map((social) => {
            const isActive = activeSocial === social.id;
            const hasValue = profile[social.field];
            return (
              <button
                key={social.id}
                onClick={() => setActiveSocial(isActive ? null : social.id)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : hasValue
                    ? "bg-secondary text-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <social.icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {activeSocial && activeSocialData && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground capitalize">
              {activeSocial}
            </label>
            <div className="flex items-center gap-3">
              <Input
                value={profile[activeSocialData.field] || ''}
                onChange={(e) => onProfileChange({ 
                  ...profile, 
                  [activeSocialData.field]: e.target.value 
                })}
                placeholder={activeSocialData.placeholder}
                className="flex-1"
              />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onProfileChange({ ...profile, [activeSocialData.field]: null })}
                className="text-muted-foreground hover:text-destructive"
              >
                🗑️
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}