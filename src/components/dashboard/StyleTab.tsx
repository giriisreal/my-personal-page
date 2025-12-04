import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const FONTS = [
  { id: 'dm-sans', name: 'DM Sans', preview: 'Aa' },
  { id: 'serif', name: 'Serif', preview: 'Aa' },
  { id: 'mono', name: 'Mono', preview: 'Aa' },
];

// Theme pairs: [background, accent]
const THEMES = [
  { id: 'light', colors: ['#ffffff', '#1a1a1a'] },
  { id: 'purple', colors: ['#ffffff', '#7c3aed'] },
  { id: 'green', colors: ['#ffffff', '#10b981'] },
  { id: 'rose', colors: ['#ffffff', '#f43f5e'] },
  { id: 'muted', colors: ['#f5f5f4', '#a8a29e'] },
  { id: 'pink', colors: ['#fdf2f8', '#ec4899'] },
  { id: 'white', colors: ['#ffffff', '#ffffff'] },
  
  { id: 'blue-light', colors: ['#dbeafe', '#3b82f6'] },
  { id: 'indigo', colors: ['#e0e7ff', '#6366f1'] },
  { id: 'emerald', colors: ['#d1fae5', '#059669'] },
  { id: 'lavender', colors: ['#ede9fe', '#8b5cf6'] },
  { id: 'peach', colors: ['#fef3c7', '#f59e0b'] },
  { id: 'navy', colors: ['#1e3a5f', '#60a5fa'] },
  
  { id: 'sky', colors: ['#e0f2fe', '#0ea5e9'] },
  { id: 'slate', colors: ['#e2e8f0', '#64748b'] },
  { id: 'teal-duo', colors: ['#ccfbf1', '#14b8a6'] },
  { id: 'violet', colors: ['#f3e8ff', '#a855f7'] },
  { id: 'amber', colors: ['#fef9c3', '#eab308'] },
  { id: 'dark-blue', colors: ['#172554', '#3b82f6'] },
  
  { id: 'coral', colors: ['#fff1f2', '#fb7185'] },
  { id: 'yellow-pink', colors: ['#fef08a', '#ec4899'] },
  { id: 'cyan-emerald', colors: ['#a5f3fc', '#10b981'] },
  { id: 'neutral', colors: ['#fafafa', '#525252'] },
  { id: 'warm-gray', colors: ['#f5f5f4', '#78716c'] },
  { id: 'midnight', colors: ['#0f172a', '#38bdf8'] },
  
  { id: 'blush', colors: ['#fce7f3', '#f472b6'] },
  { id: 'sunset', colors: ['#fed7aa', '#ea580c'] },
  { id: 'forest', colors: ['#bbf7d0', '#16a34a'] },
  { id: 'cool-gray', colors: ['#f3f4f6', '#6b7280'] },
  { id: 'stone', colors: ['#f5f5f4', '#a8a29e'] },
  { id: 'ocean', colors: ['#0c4a6e', '#7dd3fc'] },
];

interface StyleTabProps {
  profileId: string;
  onStyleChange?: (font: string, theme: string) => void;
}

export function StyleTab({ profileId, onStyleChange }: StyleTabProps) {
  const [selectedFont, setSelectedFont] = useState('dm-sans');
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const savedFont = localStorage.getItem(`style_font_${profileId}`);
    const savedTheme = localStorage.getItem(`style_theme_${profileId}`);
    if (savedFont) setSelectedFont(savedFont);
    if (savedTheme) setSelectedTheme(savedTheme);
  }, [profileId]);

  const handleFontChange = (fontId: string) => {
    setSelectedFont(fontId);
    setHasChanges(true);
    onStyleChange?.(fontId, selectedTheme);
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    setHasChanges(true);
    onStyleChange?.(selectedFont, themeId);
  };

  const handleSave = () => {
    localStorage.setItem(`style_font_${profileId}`, selectedFont);
    localStorage.setItem(`style_theme_${profileId}`, selectedTheme);
    setHasChanges(false);
    toast.success('Style saved!');
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Font Section */}
      <div>
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Font</h3>
        <div className="inline-flex items-center bg-secondary rounded-xl p-1 gap-1">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => handleFontChange(font.id)}
              className={cn(
                "px-6 py-3 rounded-lg text-xl font-bold transition-all",
                font.id === 'dm-sans' && "font-sans",
                font.id === 'serif' && "font-serif",
                font.id === 'mono' && "font-mono",
                selectedFont === font.id 
                  ? "bg-background shadow-sm" 
                  : "hover:bg-background/50"
              )}
              title={font.name}
            >
              {font.preview}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Section */}
      <div>
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Theme</h3>
        
        {/* Light/Dark base options */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={cn(
              "w-14 h-14 rounded-xl border-2 overflow-hidden transition-all",
              selectedTheme === 'light' 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="w-full h-full bg-white" />
          </button>
          <button
            onClick={() => handleThemeChange('purple')}
            className={cn(
              "w-14 h-14 rounded-xl border-2 overflow-hidden transition-all flex",
              selectedTheme === 'purple' 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="w-1/2 h-full bg-white" />
            <div className="w-1/2 h-full bg-violet-500" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-6 gap-3">
          {THEMES.slice(2).map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={cn(
                "w-full aspect-square rounded-xl border-2 overflow-hidden transition-all flex",
                selectedTheme === theme.id 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <div 
                className="w-1/2 h-full" 
                style={{ backgroundColor: theme.colors[0] }} 
              />
              <div 
                className="w-1/2 h-full" 
                style={{ backgroundColor: theme.colors[1] }} 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges}
          className="w-full sm:w-auto"
        >
          Save Style
        </Button>
      </div>
    </div>
  );
}
