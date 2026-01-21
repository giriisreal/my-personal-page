import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { PageTab } from '@/components/dashboard/PageTab';
import { StyleTab } from '@/components/dashboard/StyleTab';
import { StatsTab } from '@/components/dashboard/StatsTab';
import { SettingsTab } from '@/components/dashboard/SettingsTab';
import { PhonePreview } from '@/components/PhonePreview';
import { Sparkles, Loader2 } from 'lucide-react';

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
  theme?: string | null;
  font?: string | null;
  is_premium?: boolean;
  premium_since?: string | null;
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
  text_color?: string;
  stripe_api_key?: string;
  lemonsqueezy_api_key?: string;
  lemonsqueezy_store_id?: string;
  live_revenue?: number;
  revenue_updated_at?: string;
  demo_video_url?: string;
  pitch_video_url?: string;
}

interface PageView {
  id: string;
  viewed_at: string;
  referrer: string | null;
  user_agent: string | null;
}

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
  position: number;
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('page');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedFont, setSelectedFont] = useState('dm-sans');
  const { toast } = useToast();
  const navigate = useNavigate();
  const claimedUsername = searchParams.get('username');

  const handleStyleChange = (font: string, theme: string) => {
    setSelectedFont(font);
    setSelectedTheme(theme);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load saved style preferences from profile
  useEffect(() => {
    if (profile) {
      setSelectedFont(profile.font || 'dm-sans');
      setSelectedTheme(profile.theme || 'light');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Auto-save profile changes
  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        handleSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [profile?.display_name, profile?.bio, profile?.twitter_url, profile?.github_url, profile?.instagram_url, profile?.linkedin_url, profile?.website_url, profile?.location, profile?.revenue]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (profileData) {
      setProfile(profileData);
      fetchCustomLinks(profileData.id);
      fetchPageViews(profileData.id);
      if (profileData.is_premium) {
        fetchGalleryImages(profileData.id);
      }
    } else if (claimedUsername) {
      await createProfile(claimedUsername);
    }
    setLoading(false);
  };

  const createProfile = async (username: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .insert({ user_id: user.id, username: username.toLowerCase() })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setProfile(data);
      toast({ title: 'Profile created!', description: `Your page is live at entrepage.space/${username}` });
    }
  };

  const fetchCustomLinks = async (profileId: string) => {
    const { data } = await supabase
      .from('custom_links')
      .select('*')
      .eq('profile_id', profileId)
      .order('position');
    if (data) setCustomLinks(data);
  };

  const fetchPageViews = async (profileId: string) => {
    const { data } = await supabase
      .from('page_views')
      .select('*')
      .eq('profile_id', profileId)
      .order('viewed_at', { ascending: false });
    if (data) setPageViews(data);
  };

  const fetchGalleryImages = async (profileId: string) => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('profile_id', profileId)
      .order('position');
    if (data) setGalleryImages(data);
  };

  const handleSave = async () => {
    if (!profile || saving) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        twitter_url: profile.twitter_url,
        github_url: profile.github_url,
        instagram_url: profile.instagram_url,
        linkedin_url: profile.linkedin_url,
        website_url: profile.website_url,
        location: profile.location,
        revenue: profile.revenue,
      })
      .eq('id', profile.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleAvatarUpload = (url: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: url });
    }
  };

  const handleUsernameUpdate = (newUsername: string) => {
    if (profile) {
      setProfile({ ...profile, username: newUsername });
    }
  };

  const addLink = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('custom_links')
      .insert({ profile_id: profile.id, title: 'New Startup', url: 'https://', position: customLinks.length })
      .select()
      .single();
    if (data) setCustomLinks([...customLinks, data]);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const updateLink = (id: string, field: keyof CustomLink, value: string | number | null) => {
    setCustomLinks(customLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const saveLink = async (link: CustomLink) => {
    const { error } = await supabase
      .from('custom_links')
      .update({ 
        title: link.title, 
        url: link.url,
        status: link.status,
        category: link.category,
        icon: link.icon,
        size: link.size,
        color: link.color,
        text_color: link.text_color,
        live_revenue: link.live_revenue,
        revenue_updated_at: link.revenue_updated_at,
      })
      .eq('id', link.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase.from('custom_links').delete().eq('id', id);
    if (!error) setCustomLinks(customLinks.filter(link => link.id !== id));
  };

  const handleLinksChange = async (newLinks: CustomLink[]) => {
    setCustomLinks(newLinks);
    // Update positions in database
    for (let i = 0; i < newLinks.length; i++) {
      await supabase
        .from('custom_links')
        .update({ position: i })
        .eq('id', newLinks[i].id);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Create your page</h1>
          <p className="text-muted-foreground mb-8">Choose a unique username to get started</p>
          <div className="max-w-md mx-auto">
            <Input
              placeholder="yourname"
              className="h-12 text-center"
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  await createProfile((e.target as HTMLInputElement).value);
                }
              }}
            />
            <p className="text-sm text-muted-foreground mt-2">Press Enter to create</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              onClick={signOut}
              className="text-muted-foreground text-sm px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Log out</span>
              <span className="sm:hidden">Exit</span>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 sm:gap-2 text-sm px-3 sm:px-4">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">DEPLOY</span>
              <span className="sm:hidden">GO</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Panel - Editor */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl w-full">
          {activeTab === 'page' && (
            <PageTab
              profile={profile}
              customLinks={customLinks}
              userId={user!.id}
              onProfileChange={setProfile}
              onLinksChange={handleLinksChange}
              onAddLink={addLink}
              onUpdateLink={updateLink}
              onSaveLink={saveLink}
              onDeleteLink={deleteLink}
              onAvatarUpload={handleAvatarUpload}
              galleryImages={galleryImages}
              onGalleryChange={setGalleryImages}
            />
          )}

          {activeTab === 'style' && <StyleTab profileId={profile.id} initialFont={profile.font || 'dm-sans'} initialTheme={profile.theme || 'light'} onStyleChange={handleStyleChange} />}

          {activeTab === 'stats' && (
            <StatsTab 
              pageViews={pageViews} 
              profileId={profile.id}
              isPremium={profile.is_premium || false}
              profileUrl={`${window.location.origin}/${profile.username}`}
              avatarUrl={profile.avatar_url}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              profile={profile} 
              onUsernameUpdate={handleUsernameUpdate}
              onProfileRefresh={fetchProfile}
            />
          )}
        </div>

        {/* Right Panel - Phone Preview */}
        {(activeTab === 'page' || activeTab === 'style') && (
          <div className="hidden lg:flex flex-shrink-0 w-[400px] items-start justify-center pt-8 sticky top-24 h-fit">
            <PhonePreview profile={profile} customLinks={customLinks} theme={selectedTheme} font={selectedFont} galleryImages={galleryImages} isPremium={profile.is_premium || false} />
          </div>
        )}
      </div>
    </div>
  );
}
