import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

interface PageView {
  id: string;
  viewed_at: string;
  referrer: string | null;
  user_agent: string | null;
}

interface AnalyticsChartProps {
  pageViews: PageView[];
}

const COLORS = ['hsl(262, 83%, 58%)', 'hsl(280, 90%, 65%)', 'hsl(300, 80%, 60%)', 'hsl(320, 70%, 55%)', 'hsl(340, 60%, 50%)'];

export function AnalyticsChart({ pageViews }: AnalyticsChartProps) {
  const last30Days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 29);
    const days = eachDayOfInterval({ start, end });
    
    const viewsByDay = new Map<string, number>();
    days.forEach(day => {
      viewsByDay.set(format(day, 'yyyy-MM-dd'), 0);
    });

    pageViews.forEach(view => {
      const day = format(new Date(view.viewed_at), 'yyyy-MM-dd');
      if (viewsByDay.has(day)) {
        viewsByDay.set(day, (viewsByDay.get(day) || 0) + 1);
      }
    });

    return Array.from(viewsByDay.entries()).map(([date, views]) => ({
      date: format(new Date(date), 'MMM d'),
      views,
    }));
  }, [pageViews]);

  const referrerData = useMemo(() => {
    const referrerCounts = new Map<string, number>();
    
    pageViews.forEach(view => {
      let source = 'Direct';
      if (view.referrer) {
        try {
          const url = new URL(view.referrer);
          source = url.hostname.replace('www.', '');
        } catch {
          source = view.referrer.slice(0, 20);
        }
      }
      referrerCounts.set(source, (referrerCounts.get(source) || 0) + 1);
    });

    return Array.from(referrerCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [pageViews]);

  const browserData = useMemo(() => {
    const browserCounts = new Map<string, number>();
    
    pageViews.forEach(view => {
      let browser = 'Other';
      const ua = view.user_agent?.toLowerCase() || '';
      
      if (ua.includes('chrome') && !ua.includes('edge')) browser = 'Chrome';
      else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
      else if (ua.includes('firefox')) browser = 'Firefox';
      else if (ua.includes('edge')) browser = 'Edge';
      
      browserCounts.set(browser, (browserCounts.get(browser) || 0) + 1);
    });

    return Array.from(browserCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [pageViews]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{payload[0].value} views</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Views Over Time */}
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Page Views (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30Days}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(220, 10%, 60%)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fill: 'hsl(220, 10%, 60%)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(262, 83%, 58%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Referrers and Browsers */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
          {referrerData.length > 0 ? (
            <div className="space-y-3">
              {referrerData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No data yet</p>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold mb-4">Browsers</h3>
          {browserData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={browserData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {browserData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {browserData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm text-muted-foreground">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
