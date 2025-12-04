import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function Index() {
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (!username.trim()) return;
    
    setChecking(true);
    const { data: available } = await supabase.rpc('check_username_available', {
      username_to_check: username.toLowerCase()
    });
    setChecking(false);

    if (available) {
      navigate(`/auth?mode=signup&username=${username.toLowerCase()}`);
    } else {
      navigate(`/${username.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="bg-card rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-lg">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Entrepage
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors font-medium">Pricing</a>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/auth?mode=login">
                <Button variant="ghost" className="text-foreground font-medium hover:bg-foreground/5 text-sm sm:text-base px-3 sm:px-4">
                  Log in
                </Button>
              </Link>
              <Link to="/auth?mode=signup" className="hidden sm:block">
                <Button className="bg-primary text-primary-foreground font-semibold rounded-full px-6">
                  Sign up free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-foreground leading-[0.95] mb-6 sm:mb-8 tracking-tight" style={{ fontStyle: 'italic' }}>
              Fill your page with startups.
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 mb-8 sm:mb-10 leading-relaxed max-w-xl">
              Join thousands of creators sharing their startups. One link to help you share everything you create, curate and sell from your social media profiles.
            </p>
            
            <div className="flex flex-col gap-3 max-w-lg">
              <div className="relative">
                <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm sm:text-base">
                 entrepage/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleGetStarted()}
                  placeholder="yourname"
                  className="w-full h-12 sm:h-14 pl-[90px] sm:pl-[110px] pr-4 rounded-full bg-card border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-lg"
                />
              </div>
              <Button 
                onClick={handleGetStarted}
                disabled={checking || !username.trim()}
                className="h-12 sm:h-14 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full text-base sm:text-lg w-full sm:w-auto"
              >
                {checking ? 'Checking...' : 'Get started for free'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center" style={{ fontStyle: 'italic' }}>
            Everything you need
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-primary-foreground/10 rounded-3xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6">
                <span className="text-2xl ">👤</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Personal Bio Page</h3>
              <p className="text-primary-foreground/80 text-lg">
                Create a beautiful profile showcasing who you are and what you're building.
              </p>
            </div>
            
            <div className="bg-primary-foreground/10 rounded-3xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Custom Links</h3>
              <p className="text-primary-foreground/80 text-lg">
                Add unlimited links to your projects, social profiles, and anything else.
              </p>
            </div>
            
            <div className="bg-primary-foreground/10 rounded-3xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Analytics</h3>
              <p className="text-primary-foreground/80 text-lg">
                Track who visits your page with built-in analytics and insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-primary text-primary-foreground border-t border-primary-foreground/20">
        <div className="container mx-auto text-center">
          <p className="text-primary-foreground/70">
            &copy; {new Date().getFullYear()} Entrepage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
