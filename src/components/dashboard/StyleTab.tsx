import { cn } from '@/lib/utils';

interface StyleTabProps {
  // Future: Add theme and font settings
}

export function StyleTab({}: StyleTabProps) {
  return (
    <div className="space-y-8">
      {/* Font Section */}
      <div>
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Font</h3>
        <button className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-2xl font-bold hover:bg-secondary/80 transition-colors border-2 border-primary">
          Aa
        </button>
      </div>

      {/* Theme Section */}
      <div>
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Theme</h3>
        <div className="flex items-center gap-3">
          <button className={cn(
            "w-12 h-12 rounded-xl bg-white border-2 border-transparent hover:border-primary transition-all"
          )} />
          <button className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 border-2 border-primary"
          )} />
        </div>
      </div>
    </div>
  );
}
