import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UsernameEditor } from '@/components/UsernameEditor';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  username: string;
}

interface SettingsTabProps {
  profile: Profile;
  onUsernameUpdate: (username: string) => void;
}

const settingsTabs = ['ACCOUNT', 'BILLING', 'SUBSCRIBERS'];

export function SettingsTab({ profile, onUsernameUpdate }: SettingsTabProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('ACCOUNT');
  const [copied, setCopied] = useState(false);

  const pageUrl = `mypage.io/${profile.username}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`https://${pageUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

          {/* MyPage Domain */}
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">MyPage domain</h3>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">
                mypage.io/<span className="text-foreground font-medium">{profile.username}</span>
              </div>
              <Button 
                variant="ghost" 
                onClick={copyToClipboard}
                className="text-muted-foreground hover:text-foreground"
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
            <div className="flex items-center gap-3">
              <Input
                placeholder="yourdomain.com"
                className="flex-1"
              />
              <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                SAVE
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeSettingsTab === 'BILLING' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-card rounded-2xl p-6 border border-border/50 text-center">
            <p className="text-muted-foreground">Billing information coming soon</p>
          </div>
        </div>
      )}

      {activeSettingsTab === 'SUBSCRIBERS' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-card rounded-2xl p-6 border border-border/50 text-center">
            <p className="text-muted-foreground">No subscribers yet</p>
          </div>
        </div>
      )}
    </div>
  );
}
