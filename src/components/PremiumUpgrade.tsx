import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, Check, Sparkles, Palette, Globe, QrCode, 
  BarChart3, Image, Loader2, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumUpgradeProps {
  profileId: string;
  isPremium: boolean;
  onUpgradeSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PREMIUM_FEATURES = [
  { icon: BarChart3, title: 'Deep Analytics', description: 'Traffic sources, device breakdown, audience location' },
  { icon: Image, title: 'Journey Gallery', description: 'Visual timeline with parallax photo gallery' },
  { icon: Globe, title: 'Custom Domain', description: 'Connect your own domain (coming soon)' },
  { icon: Sparkles, title: 'Remove Branding', description: 'Hide "Build your Entrepage" badge' },
  { icon: Palette, title: 'All Themes', description: 'Unlock 30+ premium themes' },
  { icon: QrCode, title: 'QR Code Generator', description: 'Custom colors, logo, high-res download' },
];

export function PremiumUpgrade({ profileId, isPremium, onUpgradeSuccess }: PremiumUpgradeProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setLoading(true);
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create order via edge function
      const { data, error } = await supabase.functions.invoke('razorpay-premium', {
        body: { action: 'create_order', profileId }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to create order');
      }

      // Open Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Entrepage',
        description: 'Lifetime Premium Access',
        order_id: data.order_id,
        handler: async (response: any) => {
          // Verify payment
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-premium', {
              body: {
                action: 'verify_payment',
                profileId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            });

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyError?.message || verifyData?.error || 'Payment verification failed');
            }

            toast({
              title: '🎉 Welcome to Premium!',
              description: 'You now have lifetime access to all premium features.',
            });
            onUpgradeSuccess();
          } catch (err: any) {
            toast({
              title: 'Verification Error',
              description: err.message,
              variant: 'destructive',
            });
          }
        },
        prefill: {},
        theme: {
          color: '#16a34a',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Premium Active</h3>
            <p className="text-sm text-muted-foreground">Lifetime access unlocked</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PREMIUM_FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>{feature.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider opacity-90">Lifetime Deal</span>
        </div>
        <h3 className="text-3xl font-bold mb-1">
          ₹499 <span className="text-lg font-normal opacity-80">one-time</span>
        </h3>
        <p className="text-sm opacity-90">Pay once, premium forever</p>
      </div>

      {/* Features */}
      <div className="p-6 space-y-4">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Everything included:
        </p>
        <div className="space-y-3">
          {PREMIUM_FEATURES.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Upgrade Now
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment via Razorpay • Instant activation
        </p>
      </div>
    </div>
  );
}
