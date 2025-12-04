import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Twitter, Github, Instagram, Linkedin, Globe, ExternalLink, 
  ArrowLeft, Loader2, Sparkles 
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
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

    // Record page view
    await supabase.from('page_views').insert({ profile_id: profileData.id });

    // Fetch custom links
    const { data: linksData } = await supabase
      .from('custom_links')
      .select('*')
      .eq('profile_id', profileData.id)
      .order('position');
    
    if (linksData) setCustomLinks(linksData);
    setLoading(false);
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
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
    <div className="min-h-screen bg-background">
      {/* Back link */}
      <div className="fixed top-4 left-4">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mx-auto mb-6 overflow-hidden shadow-glow">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name || ''} className="w-full h-full object-cover" />
            ) : (
              profile?.display_name?.charAt(0).toUpperCase() || profile?.username.charAt(0).toUpperCase()
            )}
          </div>

          {/* Name */}
          <h1 className="text-3xl font-bold mb-2">
            {profile?.display_name || `@${profile?.username}`}
          </h1>
          
          {profile?.display_name && (
            <p className="text-muted-foreground mb-4">@{profile.username}</p>
          )}

          {/* Bio */}
          {profile?.bio && (
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">{profile.bio}</p>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-3 mb-8">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          )}

          {/* Custom Links */}
          {customLinks.length > 0 && (
            <div className="space-y-3">
              {customLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-glow transition-all duration-300 group"
                >
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {link.title}
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          )}

          {/* Powered by */}
          <div className="mt-12">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
