import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2, Pencil } from 'lucide-react';

interface UsernameEditorProps {
  currentUsername: string;
  profileId: string;
  onUpdate: (newUsername: string) => void;
}

export function UsernameEditor({ currentUsername, profileId, onUpdate }: UsernameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(currentUsername);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setUsername(currentUsername);
  }, [currentUsername]);

  const checkAvailability = async (value: string) => {
    if (value.length < 3 || value === currentUsername) {
      setIsAvailable(value === currentUsername ? true : null);
      return;
    }
    
    setChecking(true);
    const { data } = await supabase.rpc('check_username_available', {
      username_to_check: value.toLowerCase(),
    });
    setIsAvailable(data ?? false);
    setChecking(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    checkAvailability(value);
  };

  const handleSave = async () => {
    if (!isAvailable || username === currentUsername) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.toLowerCase() })
      .eq('id', profileId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Username updated!', description: `Your new URL is mypage.io/${username}` });
      onUpdate(username);
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setUsername(currentUsername);
    setIsAvailable(null);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input value={currentUsername} disabled className="bg-secondary/50" />
          <p className="text-xs text-muted-foreground mt-1">mypage.io/{currentUsername}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Pencil className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={username}
            onChange={handleChange}
            placeholder="newusername"
            className={username !== currentUsername && isAvailable !== null ? (isAvailable ? 'border-green-500' : 'border-destructive') : ''}
          />
          {username.length >= 3 && username !== currentUsername && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checking ? (
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              ) : isAvailable ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-destructive" />
              )}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">mypage.io/{username}</p>
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          onClick={handleSave} 
          disabled={!isAvailable || username === currentUsername || saving}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
