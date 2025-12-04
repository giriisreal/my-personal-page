import { Twitter, Github, Instagram, Linkedin, Mail, MapPin, ExternalLink } from 'lucide-react';

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
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
}

interface PhonePreviewProps {
  profile: Profile;
  customLinks: CustomLink[];
}

export function PhonePreview({ profile, customLinks }: PhonePreviewProps) {
  const socialLinks = [
    { icon: Twitter, url: profile.twitter_url },
    { icon: Instagram, url: profile.instagram_url },
    { icon: Mail, url: profile.website_url },
    { icon: Linkedin, url: profile.linkedin_url },
  ].filter(link => link.url);

  return (
    <div className="relative">
      {/* Phone frame */}
      <div className="w-[280px] h-[580px] bg-white rounded-[40px] p-3 shadow-2xl border-4 border-gray-800">
        {/* Phone inner content */}
        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col">
          {/* Notch area */}
          <div className="h-6 bg-white flex items-center justify-center">
            <div className="w-20 h-5 bg-black rounded-full" />
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Share button */}
            <div className="flex justify-end mb-4">
              <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden ring-4 ring-white shadow-lg">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.display_name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Name */}
            <h2 className="text-center text-lg font-bold text-gray-900">
              {profile.display_name || profile.username}
            </h2>
            
            {/* Location */}
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              <span>Location</span>
              <span className="ml-1">$1k/mo</span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-center text-sm text-gray-600 mt-3 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Email subscribe */}
            <div className="mt-4 flex gap-2">
              <input 
                type="email" 
                placeholder="you@email.com"
                className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm bg-gray-50"
                disabled
              />
              <button className="h-10 px-4 bg-pink-500 text-white text-sm font-medium rounded-lg">
                Subscribe
              </button>
            </div>

            {/* Links */}
            <div className="mt-4 space-y-2">
              {customLinks.slice(0, 3).map((link) => (
                <div 
                  key={link.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚀</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{link.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">
                        {link.url.replace('https://', '')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    Active
                  </span>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {socialLinks.length > 0 ? (
                socialLinks.map((link, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <link.icon className="w-4 h-4 text-gray-500" />
                  </div>
                ))
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Twitter className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
