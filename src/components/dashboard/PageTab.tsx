import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
  position: number;
}

interface PageTabProps {
  profile: Profile;
  customLinks: CustomLink[];
  userId: string;
  onProfileChange: (profile: Profile) => void;
  onLinksChange: (links: CustomLink[]) => void;
  onAddLink: () => void;
  onUpdateLink: (id: string, field: 'title' | 'url', value: string) => void;
  onSaveLink: (link: CustomLink) => void;
  onDeleteLink: (id: string) => void;
  onAvatarUpload: (url: string) => void;
}

const socialIcons = [
  { id: 'twitter', icon: Twitter, field: 'twitter_url' as const },
  { id: 'github', icon: Github, field: 'github_url' as const },
  { id: 'instagram', icon: Instagram, field: 'instagram_url' as const },
  { id: 'linkedin', icon: Linkedin, field: 'linkedin_url' as const },
  { id: 'youtube', icon: Youtube, field: 'website_url' as const },
  { id: 'mail', icon: Mail, field: 'website_url' as const },
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
  const [activeSocial, setActiveSocial] = useState<string | null>(
    profile.twitter_url ? 'twitter' : null
  );

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
            className="bg-transparent border-none p-0 resize-none focus-visible:ring-0 text-muted-foreground"
            rows={2}
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <a href="#" className="text-sm">Markdown guide</a>
        <span className="text-xs">↗</span>
      </div>

      {/* Location, Revenue, Contact icons */}
      <div className="flex items-center gap-3 border-t border-border/50 pt-6">
        <button className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <MapPin className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <DollarSign className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Mail className="w-5 h-5" />
        </button>
      </div>

      {/* Add Startup Button */}
      <Button 
        onClick={onAddLink}
        className="w-full h-14 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-base"
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
                    ? "bg-pink-500 text-white" 
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
                placeholder={`https://x.com/username`}
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
