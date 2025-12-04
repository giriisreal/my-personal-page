import { Mail, Eye, MousePointer, Link2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

interface PageView {
  id: string;
  viewed_at: string;
  referrer: string | null;
}

interface StatsTabProps {
  pageViews: PageView[];
}

export function StatsTab({ pageViews }: StatsTabProps) {
  // Calculate stats
  const uniqueVisitors = new Set(pageViews.map(v => v.viewed_at.split('T')[0])).size || pageViews.length;
  
  // Prepare chart data for last 7 days
  const endDate = new Date();
  const startDate = subDays(endDate, 6);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const chartData = days.map(day => {
    const dayStart = startOfDay(day);
    const dayViews = pageViews.filter(view => {
      const viewDate = startOfDay(new Date(view.viewed_at));
      return viewDate.getTime() === dayStart.getTime();
    });
    return {
      date: format(day, 'MMM dd'),
      views: dayViews.length,
    };
  });

  // Calculate referrer sources
  const referrerCounts: Record<string, number> = {};
  pageViews.forEach(view => {
    const source = view.referrer 
      ? new URL(view.referrer).hostname.replace('www.', '')
      : 'Direct/None';
    referrerCounts[source] = (referrerCounts[source] || 0) + 1;
  });

  const sources = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxSourceCount = Math.max(...sources.map(s => s[1]), 1);

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium">
          7 days
          <span className="text-muted-foreground">▼</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Subscribers Card */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Mail className="w-4 h-4" />
            <span className="text-sm">Subscribers</span>
          </div>
          <div className="text-4xl font-bold">0</div>
          <div className="mt-auto pt-8">
            <div className="h-1 bg-pink-500 rounded-full" style={{ width: '20%' }} />
          </div>
        </div>

        {/* Unique Visitors Card */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Unique visitors</span>
          </div>
          <div className="text-4xl font-bold">{uniqueVisitors}</div>
          <div className="mt-4 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(262, 83%, 58%)"
                  strokeWidth={2}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clicks Card */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MousePointer className="w-4 h-4" />
            <span className="text-sm">Clicks</span>
          </div>
          <div className="text-4xl font-bold">0</div>
        </div>

        {/* Source Card */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              <span className="text-sm">Source</span>
            </div>
            <span className="text-sm">Visitors</span>
          </div>
          <div className="space-y-3">
            {sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              sources.map(([source, count]) => (
                <div key={source} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-3 h-3 text-muted-foreground" />
                      <span>{source}</span>
                    </div>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                      style={{ width: `${(count / maxSourceCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
