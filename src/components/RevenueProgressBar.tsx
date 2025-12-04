import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface RevenueProgressBarProps {
  revenue: number;
  color?: string;
  className?: string;
  showMilestones?: boolean;
}

// Revenue milestones for progress calculation
const MILESTONES = [
  { value: 1000, label: '$1K' },
  { value: 5000, label: '$5K' },
  { value: 10000, label: '$10K' },
  { value: 50000, label: '$50K' },
  { value: 100000, label: '$100K' },
  { value: 500000, label: '$500K' },
  { value: 1000000, label: '$1M' },
];

export function RevenueProgressBar({ revenue, color, className, showMilestones = false }: RevenueProgressBarProps) {
  // Find the current milestone bracket
  const currentMilestone = MILESTONES.find(m => revenue < m.value) || MILESTONES[MILESTONES.length - 1];
  const prevMilestone = MILESTONES[MILESTONES.indexOf(currentMilestone) - 1] || { value: 0, label: '$0' };
  
  // Calculate progress percentage within current bracket
  const range = currentMilestone.value - prevMilestone.value;
  const progress = Math.min(100, ((revenue - prevMilestone.value) / range) * 100);
  
  const formatRevenue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const barColor = color || 'hsl(var(--primary))';
  const isWhiteTheme = color === 'white';
  const textColor = isWhiteTheme ? 'white' : barColor;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: isWhiteTheme ? 'rgba(255,255,255,0.7)' : undefined }} />
          <span className="text-sm font-semibold" style={{ color: textColor }}>
            {formatRevenue(revenue)}/mo
          </span>
        </div>
        {showMilestones && (
          <span className="text-xs" style={{ color: isWhiteTheme ? 'rgba(255,255,255,0.7)' : undefined }}>
            → {currentMilestone.label}
          </span>
        )}
      </div>
      
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${Math.max(5, progress)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      
      {showMilestones && (
        <div 
          className="flex justify-between text-[10px]"
          style={{ color: isWhiteTheme ? 'rgba(255,255,255,0.7)' : undefined }}
        >
          <span>{prevMilestone.label}</span>
          <span>{currentMilestone.label}</span>
        </div>
      )}
    </div>
  );
}
