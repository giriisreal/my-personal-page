import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RevenueProgressBar } from '@/components/RevenueProgressBar';
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
  live_revenue?: number;
}

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
    <div className="min-h-screen bg-[#FDF6EC]">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 max-w-7xl mx-auto">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              {/* Avatar */}
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-lime-300 to-green-500 flex items-center justify-center text-white font-bold text-5xl mx-auto lg:mx-0 mb-6 overflow-hidden shadow-lg border-4 border-white">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name || ''} className="w-full h-full object-cover" />
                ) : (
                  profile?.display_name?.charAt(0).toUpperCase() || profile?.username.charAt(0).toUpperCase()
                )}
              </div>

              {/* Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center lg:text-left">
                {profile?.display_name || profile?.username}
              </h1>
              
              {/* Location & Revenue */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-gray-600 mb-4">
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
                    className="h-12 px-5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg"
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

              {/* Build your page CTA */}
              <Link to="/">
                <Button className="w-full h-12 bg-[hsl(150,80%,20%)] hover:bg-[hsl(150,80%,25%)] text-white font-semibold rounded-lg gap-2">
                  <Sparkles className="w-4 h-4" />
                  Build your Entrepage
                </Button>
              </Link>
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
                          <h3 className="font-bold text-white text-lg">
                            {link.title || 'Untitled'}
                          </h3>
                          <p className="text-white/80 text-sm">
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
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                            {link.category}
                          </span>
                        )}
                      </div>

                      {/* Revenue Progress Bar */}
                      {link.live_revenue !== null && link.live_revenue !== undefined && (
                        <div className="mt-4 bg-white/10 rounded-lg p-3 [&_.bg-secondary]:bg-white/20">
                          <RevenueProgressBar 
                            revenue={link.live_revenue} 
                            color="white"
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
          </div>
        </div>
      </div>
    </div>
  );
}
