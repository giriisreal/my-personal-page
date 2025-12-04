import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  displayName: string | null;
  username: string;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ userId, currentAvatarUrl, displayName, username, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image must be less than 2MB', variant: 'destructive' });
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Error', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    onUpload(`${publicUrl}?t=${Date.now()}`);
    setUploading(false);
    toast({ title: 'Avatar uploaded!' });
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden shadow-lg shadow-purple-500/25">
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt={displayName || ''} className="w-full h-full object-cover" />
        ) : (
          displayName?.charAt(0).toUpperCase() || username.charAt(0).toUpperCase()
        )}
      </div>
      <div className="absolute inset-0 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-foreground" />
        ) : (
          <Camera className="w-6 h-6 text-foreground" />
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
