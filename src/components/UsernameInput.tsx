import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function UsernameInput() {
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const checkAvailability = async (value: string) => {
    if (value.length < 3) {
      setIsAvailable(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && isAvailable) {
      navigate(`/auth?mode=signup&username=${username}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
          mypage.io/
        </div>
        <Input
          value={username}
          onChange={handleChange}
          placeholder="yourname"
          className="pl-24 h-14 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary text-base"
        />
        {username.length >= 3 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {checking ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : isAvailable ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <X className="w-5 h-5 text-destructive" />
            )}
          </div>
        )}
      </div>
      <Button 
        type="submit" 
        variant="hero" 
        size="xl"
        disabled={!isAvailable || checking}
        className="gap-2"
      >
        Claim my page
        <ArrowRight className="w-5 h-5" />
      </Button>
    </form>
  );
}
