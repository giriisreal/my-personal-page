import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UsernameEditor } from '@/components/UsernameEditor';
import { Copy, Check, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

interface SettingsTabProps {
  profile: Profile;
  onUsernameUpdate: (username: string) => void;
}

const settingsTabs = ['ACCOUNT', 'BILLING', 'SUBSCRIBERS'];

export function SettingsTab({ profile, onUsernameUpdate }: SettingsTabProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('ACCOUNT');
  const [copied, setCopied] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [customDomain, setCustomDomain] = useState('');
  const { toast } = useToast();

  const liveUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pageUrl = `${liveUrl}/${profile.username}`;

  useEffect(() => {
    if (activeSettingsTab === 'SUBSCRIBERS') {
      fetchSubscribers();
    }
  }, [activeSettingsTab, profile.id]);

  const fetchSubscribers = async () => {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('profile_id', profile.id)
      .order('subscribed_at', { ascending: false });
    
    if (data) setSubscribers(data);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportSubscribers = () => {
    if (subscribers.length === 0) {
      toast({ title: 'No subscribers', description: 'You have no subscribers to export yet.' });
      return;
    }
    
    const csv = ['Email,Subscribed At', ...subscribers.map(s => `${s.email},${new Date(s.subscribed_at).toLocaleDateString()}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${profile.username}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Settings Sub-tabs */}
      <div className="flex items-center gap-2 justify-center">
        {settingsTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSettingsTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeSettingsTab === tab
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSettingsTab === 'ACCOUNT' && (
        <div className="max-w-xl mx-auto space-y-8">
          {/* Change Username */}
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Change username</h3>
            <UsernameEditor
              currentUsername={profile.username}
              profileId={profile.id}
              onUpdate={onUsernameUpdate}
            />
          </div>

          {/* Live URL */}
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Your page URL</h3>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground truncate pr-4">
                {liveUrl}/<span className="text-foreground font-medium">{profile.username}</span>
              </div>
              <Button 
                variant="ghost" 
                onClick={copyToClipboard}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                {copied ? (
                  <><Check className="w-4 h-4 mr-2" />Copied</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" />COPY</>
                )}
              </Button>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Custom domain</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your own domain to your page. This feature requires a paid plan.
            </p>
            <div className="flex items-center gap-3">
              <Input
                placeholder="yourdomain.com"
                className="flex-1"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => toast({ title: 'Coming soon', description: 'Custom domains will be available soon!' })}
              >
                SAVE
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeSettingsTab === 'BILLING' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">Free</p>
                <p className="text-sm text-muted-foreground">Basic features included</p>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => toast({ title: 'Coming soon', description: 'Pro plans will be available soon!' })}
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Pro Features</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Custom domain support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Remove branding</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeSettingsTab === 'SUBSCRIBERS' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Your Subscribers</h3>
                <p className="text-sm text-muted-foreground">{subscribers.length} total subscribers</p>
              </div>
              {subscribers.length > 0 && (
                <Button variant="outline" onClick={exportSubscribers} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              )}
            </div>

            {subscribers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No subscribers yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your page to start collecting subscribers
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {subscribers.map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{subscriber.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Subscribed {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
