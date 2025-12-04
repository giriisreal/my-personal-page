import { Twitter, Github, Instagram, Linkedin, Mail, MapPin, Share2, Link as LinkIcon } from 'lucide-react';

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

export function PhonePreview({ profile, customLinks }: PhonePreviewProps) {
  const liveUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${profile.username}` 
    : `/${profile.username}`;

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
        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col">
          {/* Notch */}
          <div className="h-7 bg-white flex items-center justify-center pt-1 flex-shrink-0">
            <div className="w-20 h-5 bg-black rounded-full" />
          </div>
          
          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 space-y-3">
            {/* Share button */}
            <div className="flex justify-end">
              <button className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-white shadow-md">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white font-bold text-xl overflow-hidden ring-3 ring-white shadow-lg">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.display_name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Name & Location */}
            <div className="text-center space-y-0.5">
              <h2 className="text-base font-bold text-gray-900">
                {profile.display_name || profile.username}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                {profile.location && (
                  <>
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{profile.location}</span>
                  </>
                )}
                {profile.location && profile.revenue && <span className="text-gray-300">|</span>}
                {profile.revenue && (
                  <span className="font-medium text-gray-700">{profile.revenue}</span>
                )}
                {!profile.location && !profile.revenue && (
                  <>
                    <MapPin className="w-2.5 h-2.5" />
                    <span>Location</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium text-gray-700">$0/mo</span>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-center text-xs text-gray-600 leading-relaxed px-1">
                {profile.bio}
              </p>
            )}

            {/* Email subscribe */}
            <div className="flex gap-1.5 bg-gray-50 p-1 rounded-lg">
              <input 
                type="email" 
                placeholder="Your email..."
                className="flex-1 h-8 px-2 rounded-md bg-white border border-gray-200 text-xs placeholder:text-gray-400"
                disabled
              />
              <button className="h-8 px-3 bg-pink-500 text-white text-xs font-semibold rounded-md shadow-sm">
                Subscribe
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Links */}
            <div className="space-y-2">
              {customLinks.map((link) => {
                const statusInfo = STATUS_LABELS[link.status || 'active'] || STATUS_LABELS.active;
                const categoryLabel = CATEGORY_LABELS[link.category || ''] || '';
                const sizeClass = getSizeClass(link.size);
                
                return (
                  <div 
                    key={link.id}
                    className={`flex items-center gap-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${sizeClass}`}
                  >
                    <span className="text-lg flex-shrink-0">{link.icon || '🚀'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{link.title || 'Untitled'}</p>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-500 truncate">
                          {link.url ? link.url.replace(/^https?:\/\//, '').split('/')[0] : 'No URL'}
                        </p>
                        {categoryLabel && (
                          <span className="text-[9px] text-gray-400">• {categoryLabel}</span>
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    link.url 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-gray-50 text-gray-300'
                  }`}
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
