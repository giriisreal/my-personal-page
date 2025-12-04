import { Twitter, Github, Instagram, Linkedin, Mail, MapPin, Share2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Profile {
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
  status?: string;
  icon?: string;
  category?: string;
  size?: string;
}

interface PhonePreviewProps {
  profile: Profile;
  customLinks: CustomLink[];
  theme?: string;
  font?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  'building': { label: 'Building...', color: 'bg-blue-100 text-blue-700' },
  'active': { label: 'Active', color: 'bg-green-100 text-green-700' },
  'on-hold': { label: 'On hold', color: 'bg-gray-100 text-gray-700' },
  'for-sale': { label: 'For Sale', color: 'bg-purple-100 text-purple-700' },
  'acquired': { label: 'Acquired', color: 'bg-yellow-100 text-yellow-700' },
  'discontinued': { label: 'Discontinued', color: 'bg-red-100 text-red-700' },
};

const CATEGORY_LABELS: Record<string, string> = {
  'saas': 'SaaS',
  'mobile-app': 'Mobile App',
  'marketplace': 'Marketplace',
  'agency': 'Agency',
  'newsletter': 'Newsletter',
  'community': 'Community',
  'ecommerce': 'E-commerce',
  'other': 'Other',
};

const THEME_STYLES: Record<string, { bg: string; text: string; secondary: string; accent: string }> = {
  'light': { bg: 'bg-white', text: 'text-gray-900', secondary: 'bg-gray-50', accent: 'bg-teal-500' },
  'dark': { bg: 'bg-zinc-900', text: 'text-white', secondary: 'bg-zinc-800', accent: 'bg-teal-500' },
  'purple': { bg: 'bg-gradient-to-br from-purple-500 to-violet-600', text: 'text-white', secondary: 'bg-white/10', accent: 'bg-white' },
  'orange': { bg: 'bg-gradient-to-br from-orange-400 to-amber-500', text: 'text-white', secondary: 'bg-white/10', accent: 'bg-white' },
  'blue': { bg: 'bg-gradient-to-br from-blue-500 to-cyan-500', text: 'text-white', secondary: 'bg-white/10', accent: 'bg-white' },
  'green': { bg: 'bg-gradient-to-br from-emerald-500 to-teal-500', text: 'text-white', secondary: 'bg-white/10', accent: 'bg-white' },
};

const FONT_CLASSES: Record<string, string> = {
  'dm-sans': 'font-sans',
  'serif': 'font-serif',
  'mono': 'font-mono',
};

export function PhonePreview({ profile, customLinks, theme = 'light', font = 'dm-sans' }: PhonePreviewProps) {
  const liveUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${profile.username}` 
    : `/${profile.username}`;

  const isImageUrl = (icon?: string) => icon?.startsWith('http') || icon?.startsWith('data:');
  const themeStyle = THEME_STYLES[theme] || THEME_STYLES.light;
  const fontClass = FONT_CLASSES[font] || FONT_CLASSES['dm-sans'];

  const socialLinks = [
    { icon: Twitter, url: profile.twitter_url, name: 'Twitter' },
    { icon: Instagram, url: profile.instagram_url, name: 'Instagram' },
    { icon: Mail, url: profile.website_url, name: 'Email' },
    { icon: Linkedin, url: profile.linkedin_url, name: 'LinkedIn' },
  ];

  const getSizeClass = (size?: string) => {
    switch (size) {
      case 'large': return 'p-4';
      case 'small': return 'p-2';
      default: return 'p-3';
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Live URL display */}
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
        <LinkIcon className="w-3 h-3" />
        <span className="truncate max-w-[200px]">{liveUrl}</span>
      </div>

      {/* Phone frame */}
      <div className="w-[280px] h-[560px] bg-white rounded-[40px] p-2.5 shadow-2xl border-[5px] border-gray-900">
        {/* Phone inner content */}
        <div className={cn("w-full h-full rounded-[32px] overflow-hidden flex flex-col", themeStyle.bg, fontClass)}>
          {/* Notch */}
          <div className={cn("h-7 flex items-center justify-center pt-1 flex-shrink-0", theme === 'light' ? 'bg-white' : 'bg-transparent')}>
            <div className="w-20 h-5 bg-black rounded-full" />
          </div>
          
          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 space-y-3">
            {/* Share button */}
            <div className="flex justify-end">
              <button className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-md", themeStyle.accent, theme === 'light' || theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden ring-3 ring-white/50 shadow-lg">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.display_name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Name & Location */}
            <div className="text-center space-y-0.5">
              <h2 className={cn("text-base font-bold", themeStyle.text)}>
                {profile.display_name || profile.username}
              </h2>
              <div className={cn("flex items-center justify-center gap-1.5 text-xs", theme === 'light' ? 'text-gray-500' : 'text-white/70')}>
                {profile.location && (
                  <>
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{profile.location}</span>
                  </>
                )}
                {profile.location && profile.revenue && <span className="opacity-50">|</span>}
                {profile.revenue && (
                  <span className="font-medium">{profile.revenue}</span>
                )}
                {!profile.location && !profile.revenue && (
                  <>
                    <MapPin className="w-2.5 h-2.5" />
                    <span>Location</span>
                    <span className="opacity-50">|</span>
                    <span className="font-medium">$0/mo</span>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className={cn("text-center text-xs leading-relaxed px-1", theme === 'light' ? 'text-gray-600' : 'text-white/80')}>
                {profile.bio}
              </p>
            )}

            {/* Email subscribe */}
            <div className={cn("flex gap-1.5 p-1 rounded-lg", themeStyle.secondary)}>
              <input 
                type="email" 
                placeholder="Your email..."
                className={cn("flex-1 h-8 px-2 rounded-md text-xs", theme === 'light' ? 'bg-white border border-gray-200 placeholder:text-gray-400' : 'bg-white/20 border-0 text-white placeholder:text-white/50')}
                disabled
              />
              <button className={cn("h-8 px-3 text-xs font-semibold rounded-md shadow-sm", themeStyle.accent, theme === 'light' || theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                Subscribe
              </button>
            </div>

            {/* Divider */}
            <div className={cn("border-t", theme === 'light' ? 'border-gray-100' : 'border-white/20')} />

            {/* Links */}
            <div className="space-y-2">
              {customLinks.map((link) => {
                const statusInfo = STATUS_LABELS[link.status || 'active'] || STATUS_LABELS.active;
                const categoryLabel = CATEGORY_LABELS[link.category || ''] || '';
                const sizeClass = getSizeClass(link.size);
                
                return (
                  <div 
                    key={link.id}
                    className={cn("flex items-center gap-2 rounded-lg transition-colors", themeStyle.secondary, sizeClass)}
                  >
                    {isImageUrl(link.icon) ? (
                      <img src={link.icon} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <span className="text-lg flex-shrink-0">{link.icon || '🚀'}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold truncate", themeStyle.text)}>{link.title || 'Untitled'}</p>
                      <div className="flex items-center gap-1">
                        <p className={cn("text-[10px] truncate", theme === 'light' ? 'text-gray-500' : 'text-white/60')}>
                          {link.url ? link.url.replace(/^https?:\/\//, '').split('/')[0] : 'No URL'}
                        </p>
                        {categoryLabel && (
                          <span className={cn("text-[9px]", theme === 'light' ? 'text-gray-400' : 'text-white/50')}>• {categoryLabel}</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Social icons */}
            <div className="flex items-center justify-center gap-4 pt-2 pb-2">
              {socialLinks.map((link, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    link.url 
                      ? (theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30')
                      : (theme === 'light' ? 'bg-gray-50 text-gray-300' : 'bg-white/10 text-white/30')
                  )}
                >
                  <link.icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
