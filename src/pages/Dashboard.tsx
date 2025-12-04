import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { AvatarUpload } from '@/components/AvatarUpload';
import { UsernameEditor } from '@/components/UsernameEditor';
import { SortableLink } from '@/components/SortableLink';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  User, Link2, Twitter, Github, Instagram, Linkedin, Globe, 
  Plus, Save, ExternalLink, BarChart3, Eye, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

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
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
  position: number;
}

interface PageView {
  id: string;
  viewed_at: string;
  referrer: string | null;
  user_agent: string | null;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const claimedUsername = searchParams.get('username');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

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
      toast({ title: 'Profile created!', description: `Your page is live at mypage.io/${username}` });
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

  const handleSave = async () => {
    if (!profile) return;
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
      })
      .eq('id', profile.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved!', description: 'Your profile has been updated.' });
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
      .insert({ profile_id: profile.id, title: 'New Link', url: 'https://', position: customLinks.length })
      .select()
      .single();
    if (data) setCustomLinks([...customLinks, data]);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const updateLink = (id: string, field: 'title' | 'url', value: string) => {
    setCustomLinks(customLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const saveLink = async (link: CustomLink) => {
    const { error } = await supabase
      .from('custom_links')
      .update({ title: link.title, url: link.url })
      .eq('id', link.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Link saved!' });
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase.from('custom_links').delete().eq('id', id);
    if (!error) setCustomLinks(customLinks.filter(link => link.id !== id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = customLinks.findIndex((link) => link.id === active.id);
    const newIndex = customLinks.findIndex((link) => link.id === over.id);
    const newLinks = arrayMove(customLinks, oldIndex, newIndex);

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 container mx-auto text-center">
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Manage your personal page</p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href={`/${profile.username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View page
                </Button>
              </a>
              <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save changes
              </Button>
            </div>
          </div>

          {/* Analytics Summary Card */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 mb-8">
            <button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Total page views</p>
                  <p className="text-3xl font-bold flex items-center gap-2">
                    <Eye className="w-6 h-6 text-muted-foreground" />
                    {pageViews.length}
                  </p>
                </div>
              </div>
              {showAnalytics ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Detailed Analytics */}
          {showAnalytics && <AnalyticsChart pageViews={pageViews} />}

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Profile Section */}
            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Profile</h2>
              </div>

              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex justify-center">
                  <AvatarUpload
                    userId={user!.id}
                    currentAvatarUrl={profile.avatar_url}
                    displayName={profile.display_name}
                    username={profile.username}
                    onUpload={handleAvatarUpload}
                  />
                </div>

                {/* Username */}
                <div>
                  <Label>Username</Label>
                  <UsernameEditor
                    currentUsername={profile.username}
                    profileId={profile.id}
                    onUpdate={handleUsernameUpdate}
                  />
                </div>

                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={profile.display_name || ''}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell people about yourself..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-6">
                <Link2 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Social Links</h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.twitter_url || ''}
                    onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                    placeholder="https://twitter.com/username"
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.github_url || ''}
                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                    placeholder="https://github.com/username"
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.instagram_url || ''}
                    onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/username"
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.linkedin_url || ''}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.website_url || ''}
                    onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Links Section */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Custom Links</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addLink} className="gap-2">
                <Plus className="w-4 h-4" />
                Add link
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={customLinks.map(link => link.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {customLinks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No custom links yet. Add one to get started!
                    </p>
                  ) : (
                    customLinks.map((link) => (
                      <SortableLink
                        key={link.id}
                        link={link}
                        onUpdate={updateLink}
                        onSave={saveLink}
                        onDelete={deleteLink}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}
