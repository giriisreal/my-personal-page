import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Twitter, Github, Instagram, Linkedin, Globe, ExternalLink, 
  ArrowLeft, Loader2, Sparkles, MapPin, Share2
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
    { icon: Github, url: profile.github_url, label: 'GitHub' },
    { icon: Instagram, url: profile.instagram_url, label: 'Instagram' },
    { icon: Linkedin, url: profile.linkedin_url, label: 'LinkedIn' },
    { icon: Globe, url: profile.website_url, label: 'Website' },
  ].filter(link => link.url) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-6">
            This username isn't taken yet — want to claim it?
          </p>
          <Link to={`/auth?mode=signup&username=${username}`}>
            <Button variant="hero">Claim @{username}</Button>
          </Link>
          <div className="mt-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Share button */}
      <div className="fixed top-4 right-4 z-10">
        <button className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-white shadow-lg hover:bg-pink-600 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 overflow-hidden shadow-xl ring-4 ring-white">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name || ''} className="w-full h-full object-cover" />
            ) : (
              profile?.display_name?.charAt(0).toUpperCase() || profile?.username.charAt(0).toUpperCase()
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {profile?.display_name || `@${profile?.username}`}
          </h1>
          
          {/* Location & Revenue */}
          {(profile?.location || profile?.revenue) && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-3">
              {profile?.location && (
                <>
                  <MapPin className="w-3 h-3" />
                  <span>{profile.location}</span>
                </>
              )}
              {profile?.location && profile?.revenue && <span className="text-gray-300">|</span>}
              {profile?.revenue && <span className="font-medium text-gray-700">{profile.revenue}</span>}
            </div>
          )}

          {/* Bio */}
          {profile?.bio && (
            <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">{profile.bio}</p>
          )}

          {/* Email Subscribe */}
          <form onSubmit={handleSubscribe} className="flex gap-2 mb-6 bg-gray-50 p-1.5 rounded-xl">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email..."
              className="flex-1 h-11 bg-white border-gray-200"
              required
            />
            <Button 
              type="submit" 
              disabled={subscribing}
              className="h-11 px-6 bg-pink-500 hover:bg-pink-600 text-white font-semibold"
            >
              {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
            </Button>
          </form>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {/* Custom Links */}
          {customLinks.length > 0 && (
            <div className="space-y-3 mb-8">
              {customLinks.map((link) => {
                const statusInfo = STATUS_LABELS[link.status || 'active'] || STATUS_LABELS.active;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                  >
                    {isImageUrl(link.icon) ? (
                      <img src={link.icon} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <span className="text-xl">{link.icon || '🚀'}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{link.title}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {link.url.replace(/^https?:\/\//, '').split('/')[0]}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </a>
                );
              })}
            </div>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-4 mb-8">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          )}

          {/* Powered by */}
          <div className="pt-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create your own page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}