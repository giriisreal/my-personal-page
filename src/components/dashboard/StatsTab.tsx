import { useState, useEffect } from 'react';
import { Mail, Eye, MousePointer, Link2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface PageView {
  id: string;
  viewed_at: string;
  referrer: string | null;
}

interface StatsTabProps {
  pageViews: PageView[];
  profileId: string;
}

export function StatsTab({ pageViews, profileId }: StatsTabProps) {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [timePeriod, setTimePeriod] = useState(7);

  useEffect(() => {
    fetchSubscribers();
  }, [profileId]);

  const fetchSubscribers = async () => {
    const { count } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);
    setSubscriberCount(count || 0);
  };

  // Filter pageViews by time period
  const filteredViews = pageViews.filter(view => {
    const viewDate = new Date(view.viewed_at);
    const cutoff = subDays(new Date(), timePeriod);
    return viewDate >= cutoff;
  });

  // Calculate unique visitors (by date for now, could be by IP if tracked)
  const uniqueVisitors = new Set(filteredViews.map(v => v.viewed_at.split('T')[0])).size || filteredViews.length;
  
  // Prepare chart data
  const endDate = new Date();
  const startDate = subDays(endDate, timePeriod - 1);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const chartData = days.map(day => {
    const dayStart = startOfDay(day);
    const dayViews = filteredViews.filter(view => {
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
  filteredViews.forEach(view => {
    try {
      const source = view.referrer 
        ? new URL(view.referrer).hostname.replace('www.', '')
        : 'Direct';
      referrerCounts[source] = (referrerCounts[source] || 0) + 1;
    } catch {
      referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1;
    }
  });

  const sources = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxSourceCount = Math.max(...sources.map(s => s[1]), 1);

  // Calculate total clicks (for now, same as page views - could track link clicks separately)
  const totalClicks = filteredViews.length;

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex justify-end">
        <select 
          value={timePeriod}
          onChange={(e) => setTimePeriod(Number(e.target.value))}
          className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium border-none outline-none cursor-pointer"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Subscribers Card */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Mail className="w-4 h-4" />
            <span className="text-sm">Subscribers</span>
          </div>
          <div className="text-4xl font-bold">{subscriberCount}</div>
          <div className="mt-auto pt-8">
            <div className="h-1 bg-primary rounded-full" style={{ width: `${Math.min(subscriberCount * 10, 100)}%` }} />
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clicks Card */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MousePointer className="w-4 h-4" />
            <span className="text-sm">Page views</span>
          </div>
          <div className="text-4xl font-bold">{totalClicks}</div>
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
                      <span className="truncate max-w-[120px]">{source}</span>
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
