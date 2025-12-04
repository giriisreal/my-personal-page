import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AvatarUpload } from '@/components/AvatarUpload';
import { BentoEditor } from '@/components/dashboard/BentoEditor';
import { 
  MapPin, DollarSign, Mail, Twitter, Github, Instagram, 
  Linkedin, Youtube 
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

  const activeSocialData = socialIcons.find(s => s.id === activeSocial);

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="flex items-start gap-6 p-4 bg-secondary/30 rounded-xl">
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
            className="min-h-[60px] resize-none bg-background/50 border border-border/50 rounded-lg p-2 focus:border-primary focus-visible:ring-0 text-muted-foreground text-sm"
            rows={2}
          />
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="flex items-center gap-3">
        {/* Location */}
        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
          <PopoverTrigger asChild>
            <button className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-sm",
              profile.location ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}>
              <MapPin className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Location</label>
              <Input
                value={profile.location || ''}
                onChange={(e) => onProfileChange({ ...profile, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="h-8 text-sm"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Revenue */}
        <Popover open={revenueOpen} onOpenChange={setRevenueOpen}>
          <PopoverTrigger asChild>
            <button className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-sm",
              profile.revenue ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}>
              <DollarSign className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Monthly Revenue</label>
              <Input
                value={profile.revenue || ''}
                onChange={(e) => onProfileChange({ ...profile, revenue: e.target.value })}
                placeholder="$5k/mo"
                className="h-8 text-sm"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Social Links */}
        {socialIcons.slice(0, 4).map((social) => {
          const hasValue = profile[social.field];
          return (
            <button
              key={social.id}
              onClick={() => setActiveSocial(activeSocial === social.id ? null : social.id)}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                activeSocial === social.id 
                  ? "bg-primary text-primary-foreground" 
                  : hasValue
                  ? "bg-secondary text-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <social.icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Active Social Input */}
      {activeSocial && activeSocialData && (
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Input
            value={profile[activeSocialData.field] || ''}
            onChange={(e) => onProfileChange({ 
              ...profile, 
              [activeSocialData.field]: e.target.value 
            })}
            placeholder={activeSocialData.placeholder}
            className="flex-1 h-8 text-sm"
          />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              onProfileChange({ ...profile, [activeSocialData.field]: null });
              setActiveSocial(null);
            }}
            className="text-muted-foreground hover:text-destructive h-8 px-2"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Bento Editor */}
      <div className="min-h-[500px]">
        <BentoEditor
          profile={profile}
          customLinks={customLinks}
          onLinksChange={onLinksChange}
          onAddLink={onAddLink}
          onUpdateLink={onUpdateLink}
          onSaveLink={onSaveLink}
          onDeleteLink={onDeleteLink}
        />
      </div>
    </div>
  );
}