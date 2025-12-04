import { Twitter, Github, Instagram, Linkedin, Mail, MapPin, Share2 } from 'lucide-react';

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

export function PhonePreview({ profile, customLinks }: PhonePreviewProps) {
  const socialLinks = [
    { icon: Twitter, url: profile.twitter_url, name: 'Twitter' },
    { icon: Instagram, url: profile.instagram_url, name: 'Instagram' },
    { icon: Mail, url: profile.website_url, name: 'Email' },
    { icon: Linkedin, url: profile.linkedin_url, name: 'LinkedIn' },
  ];

  return (
    <div className="relative">
      {/* Phone frame */}
      <div className="w-[300px] h-[600px] bg-white rounded-[45px] p-3 shadow-2xl border-[6px] border-gray-900">
        {/* Phone inner content */}
        <div className="w-full h-full bg-white rounded-[36px] overflow-hidden flex flex-col">
          {/* Notch */}
          <div className="h-8 bg-white flex items-center justify-center pt-1">
            <div className="w-24 h-6 bg-black rounded-full" />
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
            {/* Share button */}
            <div className="flex justify-end">
              <button className="w-9 h-9 rounded-xl bg-pink-500 flex items-center justify-center text-white shadow-lg">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white font-bold text-2xl overflow-hidden ring-4 ring-white shadow-xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.display_name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Name & Location */}
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-gray-900">
                {profile.display_name || profile.username}
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{profile.location || 'Location'}</span>
                <span className="text-gray-300">|</span>
                <span className="font-medium text-gray-700">{profile.revenue || '$0/mo'}</span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-center text-sm text-gray-600 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Email subscribe */}
            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
              <input 
                type="email" 
                placeholder="Your email..."
                className="flex-1 h-10 px-3 rounded-lg bg-white border border-gray-200 text-sm placeholder:text-gray-400"
                disabled
              />
              <button className="h-10 px-5 bg-pink-500 text-white text-sm font-semibold rounded-lg shadow-md">
                Subscribe
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Links */}
            <div className="space-y-3">
              {customLinks.slice(0, 4).map((link) => {
                const statusInfo = STATUS_LABELS[link.status || 'active'] || STATUS_LABELS.active;
                return (
                  <div 
                    key={link.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">{link.icon || '🚀'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{link.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {link.url ? link.url.replace(/^https?:\/\//, '').split('/')[0] : 'No URL'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Social icons */}
            <div className="flex items-center justify-center gap-5 pt-4 pb-2">
              {socialLinks.map((link, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    link.url 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-gray-50 text-gray-300'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}