import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RevenueProgressBar } from '@/components/RevenueProgressBar';
import { ParallaxScroll } from '@/components/ui/parallax-scroll';
import { 
  Twitter, Github, Instagram, Linkedin, Globe, Youtube,
  ArrowLeft, Loader2, Sparkles, MapPin
} from 'lucide-react';

interface Profile {
  id: string;
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
  theme?: string | null;
  font?: string | null;
  is_premium?: boolean;
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
  live_revenue?: number;
}

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
}

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

const isDark = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  'building': { label: 'Building...', color: 'bg-blue-100 text-blue-700' },
  'active': { label: 'Active', color: 'bg-green-100 text-green-700' },
  'on-hold': { label: 'On hold', color: 'bg-gray-100 text-gray-700' },
  'for-sale': { label: 'For Sale', color: 'bg-purple-100 text-purple-700' },
  'acquired': { label: 'Acquired', color: 'bg-yellow-100 text-yellow-700' },
  'discontinued': { label: 'Discontinued', color: 'bg-red-100 text-red-700' },
};

const isImageUrl = (icon?: string) => icon?.startsWith('http') || icon?.startsWith('data:');

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    if (!username) return;

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error || !profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // Record page view with referrer
    await supabase.from('page_views').insert({ 
      profile_id: profileData.id,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent || null,
    });

    // Fetch custom links
    const { data: linksData } = await supabase
      .from('custom_links')
      .select('*')
      .eq('profile_id', profileData.id)
      .order('position');
    
    if (linksData) setCustomLinks(linksData);

    // Fetch gallery images for premium users
    if (profileData.is_premium) {
      const { data: galleryData } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('position');
      if (galleryData) setGalleryImages(galleryData);
    }

    setLoading(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !email.trim()) return;

    setSubscribing(true);
    const { error } = await supabase
      .from('subscribers')
      .insert({ profile_id: profile.id, email: email.trim() });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already subscribed', description: 'This email is already subscribed.' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Subscribed!', description: 'You\'ll receive updates from this creator.' });
      setEmail('');
    }
    setSubscribing(false);
  };

  const socialLinks = profile ? [
    { icon: Twitter, url: profile.twitter_url, label: 'Twitter' },
    { icon: Youtube, url: null, label: 'YouTube' },
    { icon: Linkedin, url: profile.linkedin_url, label: 'LinkedIn' },
    { icon: Instagram, url: profile.instagram_url, label: 'Instagram' },
  ] : [];

  // Get theme colors
  const themeColors = profile ? (THEMES[profile.theme || 'light'] || THEMES.light) : THEMES.light;
  const [bgColor, accentColor] = themeColors;
  const darkBg = isDark(bgColor);
  const fontClass = profile ? (FONT_CLASSES[profile.font || 'dm-sans'] || FONT_CLASSES['dm-sans']) : FONT_CLASSES['dm-sans'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(150,80%,20%)]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(150,80%,20%)] flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Page not found</h1>
          <p className="text-gray-600 mb-6">
            This username isn't taken yet — want to claim it?
          </p>
          <Link to={`/auth?mode=signup&username=${username}`}>
            <Button className="bg-[hsl(150,80%,20%)] hover:bg-[hsl(150,80%,25%)] text-white">Claim @{username}</Button>
          </Link>
          <div className="mt-4">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${fontClass}`} style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 max-w-7xl mx-auto">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              {/* Avatar */}
              <div className="w-40 h-40 rounded-full flex items-center justify-center text-white font-bold text-5xl mx-auto lg:mx-0 mb-6 overflow-hidden shadow-lg border-4 border-white" style={{ backgroundColor: accentColor }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name || ''} className="w-full h-full object-cover" />
                ) : (
                  profile?.display_name?.charAt(0).toUpperCase() || profile?.username.charAt(0).toUpperCase()
                )}
              </div>

              {/* Name */}
              <h1 className="text-3xl font-bold mb-3 text-center lg:text-left" style={{ color: darkBg ? '#fff' : '#1a1a1a' }}>
                {profile?.display_name || profile?.username}
              </h1>
              
              {/* Location & Revenue */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4" style={{ color: darkBg ? 'rgba(255,255,255,0.7)' : '#4b5563' }}>
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.revenue && (
                  <div className="flex items-center gap-1">
                    <span className="text-lg">💰</span>
                    <span className="font-semibold text-gray-900">{profile.revenue}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-6 leading-relaxed text-center lg:text-left italic">
                {profile?.bio || 'No bio yet...'}
              </p>

              {/* Email Subscribe */}
              <form onSubmit={handleSubscribe} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email..."
                    className="flex-1 h-12 bg-white border-gray-200 rounded-lg"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={subscribing}
                    className="h-12 px-5 font-semibold rounded-lg"
                    style={{ backgroundColor: accentColor, color: isDark(accentColor) ? '#fff' : '#1a1a1a' }}
                  >
                    {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
                  </Button>
                </div>
              </form>

              {/* Social Links */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                {socialLinks.map((link, i) => (
                  link.url ? (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all"
                      aria-label={link.label}
                    >
                      <link.icon className="w-5 h-5" />
                    </a>
                  ) : (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300"
                    >
                      <link.icon className="w-5 h-5" />
                    </div>
                  )
                ))}
              </div>

              {/* Build your page CTA - Hidden for premium users */}
              {!profile?.is_premium && (
                <Link to="/">
                  <Button 
                    className="w-full h-12 font-semibold rounded-lg gap-2 hover:opacity-90"
                    style={{ backgroundColor: accentColor, color: isDark(accentColor) ? '#fff' : '#1a1a1a' }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Build your Entrepage
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right Side - Project Cards Grid */}
          <div className="flex-1">
            {customLinks.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
              {customLinks.map((link) => {
                  const statusInfo = STATUS_LABELS[link.status || 'active'] || STATUS_LABELS.active;
                  const isLarge = link.size === 'large';
                  const linkColor = link.color || 'hsl(150, 80%, 35%)';
                  const textColor = link.text_color || 'white';
                  
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition-all group ${isLarge ? 'md:col-span-2' : ''}`}
                      style={{ backgroundColor: linkColor }}
                    >
                      {/* Card Header */}
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {isImageUrl(link.icon) ? (
                            <img src={link.icon} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="text-2xl">{link.icon || '🚀'}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg" style={{ color: textColor }}>
                            {link.title || 'Untitled'}
                          </h3>
                          <p className="text-sm" style={{ color: textColor, opacity: 0.8 }}>
                            {link.url ? link.url.replace(/^https?:\/\//, '').split('/')[0] : 'No description'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge & Category */}
                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {link.category && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20" style={{ color: textColor }}>
                            {link.category}
                          </span>
                        )}
                      </div>

                      {/* Revenue Progress Bar */}
                      {link.live_revenue !== null && link.live_revenue !== undefined && (
                        <div className="mt-4 bg-white/10 rounded-lg p-3 [&_.bg-secondary]:bg-white/20">
                          <RevenueProgressBar 
                            revenue={link.live_revenue} 
                            color={textColor}
                          />
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                <p className="text-gray-500">No projects added yet</p>
              </div>
            )}

            {/* Journey Gallery for Premium Users */}
            {profile?.is_premium && galleryImages.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4" style={{ color: darkBg ? '#fff' : '#1a1a1a' }}>
                  Journey
                </h2>
                <ParallaxScroll 
                  images={galleryImages.map(img => ({
                    id: img.id,
                    url: img.image_url,
                    title: img.title || undefined,
                    category: img.category || undefined,
                  }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
