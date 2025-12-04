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
  color?: string;
  text_color?: string;
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

// Theme pairs: [background, accent]
const THEMES: Record<string, [string, string]> = {
  'light': ['#ffffff', '#1a1a1a'],
  'purple': ['#ffffff', '#7c3aed'],
  'green': ['#ffffff', '#10b981'],
  'rose': ['#ffffff', '#f43f5e'],
  'muted': ['#f5f5f4', '#a8a29e'],
  'pink': ['#fdf2f8', '#ec4899'],
  'white': ['#ffffff', '#ffffff'],
  'blue-light': ['#dbeafe', '#3b82f6'],
  'indigo': ['#e0e7ff', '#6366f1'],
  'emerald': ['#d1fae5', '#059669'],
  'lavender': ['#ede9fe', '#8b5cf6'],
  'peach': ['#fef3c7', '#f59e0b'],
  'navy': ['#1e3a5f', '#60a5fa'],
  'sky': ['#e0f2fe', '#0ea5e9'],
  'slate': ['#e2e8f0', '#64748b'],
  'teal-duo': ['#ccfbf1', '#14b8a6'],
  'violet': ['#f3e8ff', '#a855f7'],
  'amber': ['#fef9c3', '#eab308'],
  'dark-blue': ['#172554', '#3b82f6'],
  'coral': ['#fff1f2', '#fb7185'],
  'yellow-pink': ['#fef08a', '#ec4899'],
  'cyan-emerald': ['#a5f3fc', '#10b981'],
  'neutral': ['#fafafa', '#525252'],
  'warm-gray': ['#f5f5f4', '#78716c'],
  'midnight': ['#0f172a', '#38bdf8'],
  'blush': ['#fce7f3', '#f472b6'],
  'sunset': ['#fed7aa', '#ea580c'],
  'forest': ['#bbf7d0', '#16a34a'],
  'cool-gray': ['#f3f4f6', '#6b7280'],
  'stone': ['#f5f5f4', '#a8a29e'],
  'ocean': ['#0c4a6e', '#7dd3fc'],
};

const FONT_CLASSES: Record<string, string> = {
  'dm-sans': 'font-sans',
  'serif': 'font-serif',
  'mono': 'font-mono',
};

// Helper to determine if a color is dark
const isDark = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

export function PhonePreview({ profile, customLinks, theme = 'light', font = 'dm-sans' }: PhonePreviewProps) {
  const liveUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${profile.username}` 
    : `/${profile.username}`;

  const isImageUrl = (icon?: string) => icon?.startsWith('http') || icon?.startsWith('data:');
  const themeColors = THEMES[theme] || THEMES.light;
  const [bgColor, accentColor] = themeColors;
  const darkBg = isDark(bgColor);
  const darkAccent = isDark(accentColor);
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
        <div 
          className={cn("w-full h-full rounded-[32px] overflow-hidden flex flex-col", fontClass)}
          style={{ backgroundColor: bgColor }}
        >
          {/* Notch */}
          <div 
            className="h-7 flex items-center justify-center pt-1 flex-shrink-0"
            style={{ backgroundColor: darkBg ? 'transparent' : bgColor }}
          >
            <div className="w-20 h-5 bg-black rounded-full" />
          </div>
          
          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 space-y-3">
            {/* Share button */}
            <div className="flex justify-end">
              <button 
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                style={{ backgroundColor: accentColor, color: darkAccent ? '#fff' : '#1a1a1a' }}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden ring-3 ring-white/50 shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ color: darkAccent ? '#fff' : '#1a1a1a' }}>
                    {profile.display_name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Name & Location */}
            <div className="text-center space-y-0.5">
              <h2 
                className="text-base font-bold"
                style={{ color: darkBg ? '#fff' : '#1a1a1a' }}
              >
                {profile.display_name || profile.username}
              </h2>
              <div 
                className="flex items-center justify-center gap-1.5 text-xs"
                style={{ color: darkBg ? 'rgba(255,255,255,0.7)' : '#6b7280' }}
              >
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
              <p 
                className="text-center text-xs leading-relaxed px-1"
                style={{ color: darkBg ? 'rgba(255,255,255,0.8)' : '#4b5563' }}
              >
                {profile.bio}
              </p>
            )}

            {/* Email subscribe */}
            <div 
              className="flex gap-1.5 p-1 rounded-lg"
              style={{ backgroundColor: darkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)' }}
            >
              <input 
                type="email" 
                placeholder="Your email..."
                className={cn(
                  "flex-1 h-8 px-2 rounded-md text-xs",
                  darkBg 
                    ? 'bg-white/20 border-0 text-white placeholder:text-white/50' 
                    : 'bg-white border border-gray-200 placeholder:text-gray-400'
                )}
                disabled
              />
              <button 
                className="h-8 px-3 text-xs font-semibold rounded-md shadow-sm"
                style={{ backgroundColor: accentColor, color: darkAccent ? '#fff' : '#1a1a1a' }}
              >
                Subscribe
              </button>
            </div>

            {/* Divider */}
            <div 
              className="border-t"
              style={{ borderColor: darkBg ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}
            />

            {/* Links */}
            <div className="space-y-2">
              {customLinks.map((link) => {
                const statusInfo = STATUS_LABELS[link.status || 'active'] || STATUS_LABELS.active;
                const categoryLabel = CATEGORY_LABELS[link.category || ''] || '';
                const sizeClass = getSizeClass(link.size);
                const linkBgColor = link.color || (darkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)');
                const textColor = link.text_color || 'white';
                const hasCustomColor = !!link.color;
                
                return (
                  <div 
                    key={link.id}
                    className={cn("rounded-lg transition-colors", sizeClass)}
                    style={{ backgroundColor: linkBgColor }}
                  >
                    <div className="flex items-center gap-2">
                      {isImageUrl(link.icon) ? (
                        <img src={link.icon} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <span className="text-lg flex-shrink-0">{link.icon || '🚀'}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-xs font-semibold truncate"
                          style={{ color: hasCustomColor ? textColor : (darkBg ? '#fff' : '#1a1a1a') }}
                        >
                          {link.title || 'Untitled'}
                        </p>
                        <p 
                          className="text-[10px] truncate"
                          style={{ color: hasCustomColor ? (textColor === 'white' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)') : (darkBg ? 'rgba(255,255,255,0.6)' : '#6b7280') }}
                        >
                          {link.url ? link.url.replace(/^https?:\/\//, '').split('/')[0] : 'No URL'}
                        </p>
                      </div>
                    </div>
                    {/* Status and Category row */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {categoryLabel && (
                        <span 
                          className="text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: hasCustomColor ? (textColor === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') : (darkBg ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)'),
                            color: hasCustomColor ? (textColor === 'white' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)') : (darkBg ? 'rgba(255,255,255,0.7)' : '#6b7280')
                          }}
                        >
                          {categoryLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social icons */}
            <div className="flex items-center justify-center gap-4 pt-2 pb-2">
              {socialLinks.map((link, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ 
                    backgroundColor: link.url 
                      ? (darkBg ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)') 
                      : (darkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.02)'),
                    color: link.url 
                      ? (darkBg ? '#fff' : '#374151') 
                      : (darkBg ? 'rgba(255,255,255,0.3)' : '#d1d5db')
                  }}
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
