import { Navbar } from '@/components/Navbar';
import { UsernameInput } from '@/components/UsernameInput';
import { ProfileCard } from '@/components/ProfileCard';
import { Sparkles, Users, BarChart3, Link2 } from 'lucide-react';

const featuredProfiles = [
  { username: 'alex', displayName: 'Alex Chen', bio: '5 projects' },
  { username: 'sarah', displayName: 'Sarah Miller', bio: '12 projects' },
  { username: 'mike', displayName: 'Mike Johnson', bio: '8 projects' },
  { username: 'emma', displayName: 'Emma Wilson', bio: '3 projects' },
  { username: 'james', displayName: 'James Lee', bio: '15 projects' },
  { username: 'olivia', displayName: 'Olivia Brown', bio: '7 projects' },
];

const features = [
  {
    icon: Users,
    title: 'Personal Bio Page',
    description: 'Create a beautiful profile showcasing who you are',
  },
  {
    icon: Link2,
    title: 'Custom Links',
    description: 'Add unlimited links to your projects, socials, and more',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track who visits your page with built-in analytics',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Join 10,000+ creators</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Create your
            <br />
            <span className="text-gradient">personal page</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Build a beautiful bio page to showcase your work, connect your socials, 
            and grow your audience — all in minutes.
          </p>
          
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <UsernameInput />
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Featured Creators</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProfiles.map((profile, i) => (
              <div key={profile.username} className="animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
                <ProfileCard {...profile} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Simple, powerful tools to create your online presence
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={feature.title}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MyPage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
