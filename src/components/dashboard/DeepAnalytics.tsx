import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, Monitor, Smartphone, Globe, Clock, 
  TrendingUp, Users, MousePointer, Lock
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { cn } from "@/lib/utils";

interface PageView {
  id: string;
  viewed_at: string;
  referrer: string | null;
  user_agent?: string | null;
  device_type?: string | null;
  country?: string | null;
  city?: string | null;
}

interface DeepAnalyticsProps {
  pageViews: PageView[];
  isPremium: boolean;
}

const TRAFFIC_SOURCES = [
  { pattern: /instagram/i, name: "Instagram", color: "#E4405F" },
  { pattern: /twitter|t\.co/i, name: "Twitter/X", color: "#1DA1F2" },
  { pattern: /linkedin/i, name: "LinkedIn", color: "#0A66C2" },
  { pattern: /whatsapp/i, name: "WhatsApp", color: "#25D366" },
  { pattern: /threads/i, name: "Threads", color: "#000000" },
  { pattern: /facebook/i, name: "Facebook", color: "#1877F2" },
  { pattern: /youtube/i, name: "YouTube", color: "#FF0000" },
  { pattern: /google/i, name: "Google", color: "#4285F4" },
  { pattern: /mail|email/i, name: "Email", color: "#EA4335" },
];

const CHART_COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#64748b"];

export function DeepAnalytics({ pageViews, isPremium }: DeepAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "365d">("30d");

  const filteredViews = useMemo(() => {
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return pageViews.filter(v => new Date(v.viewed_at) >= cutoff);
  }, [pageViews, timeRange]);

  // Traffic sources analysis
  const trafficSources = useMemo(() => {
    const sources: Record<string, number> = { Direct: 0 };
    TRAFFIC_SOURCES.forEach(s => sources[s.name] = 0);

    filteredViews.forEach(view => {
      if (!view.referrer) {
        sources["Direct"]++;
        return;
      }
      const matched = TRAFFIC_SOURCES.find(s => s.pattern.test(view.referrer!));
      if (matched) {
        sources[matched.name]++;
      } else {
        sources["Other"] = (sources["Other"] || 0) + 1;
      }
    });

    return Object.entries(sources)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: TRAFFIC_SOURCES.find(s => s.name === name)?.color || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredViews]);

  // Device breakdown
  const deviceData = useMemo(() => {
    const devices = { Mobile: 0, Desktop: 0, Tablet: 0 };
    filteredViews.forEach(view => {
      if (view.device_type) {
        devices[view.device_type as keyof typeof devices] = 
          (devices[view.device_type as keyof typeof devices] || 0) + 1;
      } else if (view.user_agent) {
        const ua = view.user_agent.toLowerCase();
        if (/mobile|android|iphone/i.test(ua)) devices.Mobile++;
        else if (/tablet|ipad/i.test(ua)) devices.Tablet++;
        else devices.Desktop++;
      }
    });
    return Object.entries(devices)
      .filter(([_, count]) => count > 0)
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i] }));
  }, [filteredViews]);

  // Daily views chart data
  const dailyViews = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
    const data: Record<string, number> = {};
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      data[key] = 0;
    }

    filteredViews.forEach(view => {
      const key = new Date(view.viewed_at).toISOString().split("T")[0];
      if (data[key] !== undefined) data[key]++;
    });

    return Object.entries(data).map(([date, views]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views,
    }));
  }, [filteredViews, timeRange]);

  // Hourly activity (when is audience most active)
  const hourlyActivity = useMemo(() => {
    const hours = Array(24).fill(0).map((_, i) => ({ hour: i, views: 0 }));
    filteredViews.forEach(view => {
      const hour = new Date(view.viewed_at).getHours();
      hours[hour].views++;
    });
    return hours.map(h => ({
      ...h,
      label: `${h.hour.toString().padStart(2, "0")}:00`,
    }));
  }, [filteredViews]);

  // Location breakdown
  const locationData = useMemo(() => {
    const locations: Record<string, number> = {};
    filteredViews.forEach(view => {
      const loc = view.country || "Unknown";
      locations[loc] = (locations[loc] || 0) + 1;
    });
    return Object.entries(locations)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredViews]);

  if (!isPremium) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Deep Analytics</h3>
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Unlock traffic sources, device breakdown, audience location, and time-based activity graphs. Premium feature.
        </p>
        <div className="grid grid-cols-2 gap-4 opacity-50">
          <div className="h-32 bg-muted/50 rounded-xl" />
          <div className="h-32 bg-muted/50 rounded-xl" />
          <div className="h-32 bg-muted/50 rounded-xl" />
          <div className="h-32 bg-muted/50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Deep Analytics</h3>
        </div>
        <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
          {(["7d", "30d", "90d", "365d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                timeRange === range
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range === "365d" ? "1y" : range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Total Views</span>
            </div>
            <p className="text-2xl font-bold">{filteredViews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Avg Daily</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.round(filteredViews.length / (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Smartphone className="w-4 h-4" />
              <span className="text-xs">Mobile</span>
            </div>
            <p className="text-2xl font-bold">
              {deviceData.find(d => d.name === "Mobile")?.value || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-xs">Countries</span>
            </div>
            <p className="text-2xl font-bold">{locationData.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Views over time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyViews}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Traffic sources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 pl-4">
                {trafficSources.slice(0, 5).map((source) => (
                  <div key={source.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="truncate">{source.name}</span>
                    </div>
                    <span className="font-medium">{source.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Audience Activity by Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyActivity}>
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 9 }} 
                    interval={2}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#16a34a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location breakdown */}
      {locationData.length > 0 && locationData[0].name !== "Unknown" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {locationData.slice(0, 10).map((loc, i) => (
                <div key={loc.name} className="bg-secondary/50 rounded-lg p-3">
                  <p className="font-medium truncate">{loc.name}</p>
                  <p className="text-2xl font-bold text-primary">{loc.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
