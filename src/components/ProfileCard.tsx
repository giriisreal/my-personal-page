import { Link } from 'react-router-dom';

interface ProfileCardProps {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}

export function ProfileCard({ username, displayName, avatarUrl, bio }: ProfileCardProps) {
  return (
    <Link 
      to={`/${username}`}
      className="group block bg-card rounded-2xl p-4 shadow-card hover:shadow-glow transition-all duration-300 border border-border/50 hover:border-primary/30"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {displayName || username}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {bio || `@${username}`}
          </p>
        </div>
      </div>
    </Link>
  );
}
