import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const FONTS = [
  { id: 'dm-sans', name: 'DM Sans', className: 'font-sans' },
  { id: 'serif', name: 'Serif', className: 'font-serif' },
  { id: 'mono', name: 'Mono', className: 'font-mono' },
];

const THEMES = [
  { id: 'light', name: 'Light', bg: 'bg-white', text: 'text-black' },
  { id: 'dark', name: 'Dark', bg: 'bg-zinc-900', text: 'text-white' },
  { id: 'purple', name: 'Purple', bg: 'bg-gradient-to-br from-purple-500 to-violet-600', text: 'text-white' },
  { id: 'blue', name: 'Blue', bg: 'bg-gradient-to-br from-blue-500 to-cyan-500', text: 'text-white' },
  { id: 'green', name: 'Green', bg: 'bg-gradient-to-br from-emerald-500 to-teal-500', text: 'text-white' },
  { id: 'indigo', name: 'Indigo', bg: 'bg-gradient-to-br from-indigo-500 to-purple-600', text: 'text-white' },
  { id: 'rose', name: 'Rose', bg: 'bg-gradient-to-br from-rose-400 to-pink-600', text: 'text-white' },
  { id: 'teal', name: 'Teal', bg: 'bg-gradient-to-br from-teal-400 to-cyan-600', text: 'text-white' },
  { id: 'slate', name: 'Slate', bg: 'bg-gradient-to-br from-slate-600 to-slate-800', text: 'text-white' },
  { id: 'amber', name: 'Amber', bg: 'bg-gradient-to-br from-amber-400 to-orange-500', text: 'text-white' },
];

interface StyleTabProps {
  profileId: string;
  onStyleChange?: (font: string, theme: string) => void;
}

export function StyleTab({ profileId, onStyleChange }: StyleTabProps) {
  const [selectedFont, setSelectedFont] = useState('dm-sans');
  const [selectedTheme, setSelectedTheme] = useState('dark');

  useEffect(() => {
    // Load saved styles from localStorage
    const savedFont = localStorage.getItem(`style_font_${profileId}`);
    const savedTheme = localStorage.getItem(`style_theme_${profileId}`);
    if (savedFont) setSelectedFont(savedFont);
    if (savedTheme) setSelectedTheme(savedTheme);
  }, [profileId]);

  const handleFontChange = (fontId: string) => {
    setSelectedFont(fontId);
    localStorage.setItem(`style_font_${profileId}`, fontId);
    onStyleChange?.(fontId, selectedTheme);
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem(`style_theme_${profileId}`, themeId);
    onStyleChange?.(selectedFont, themeId);
  };

  return (
    <div className="space-y-8 max-w-xl">
      {/* Font Section */}
      <div>
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Font</h3>
        <div className="flex items-center gap-3">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => handleFontChange(font.id)}
              className={cn(
                "w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-2xl font-bold hover:bg-secondary/80 transition-all relative",
                font.className,
                selectedFont === font.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              Aa
              {selectedFont === font.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Section */}
      <div>
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Theme</h3>
        <div className="flex items-center gap-3 flex-wrap">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={cn(
                "w-12 h-12 rounded-xl transition-all relative",
                theme.bg,
                selectedTheme === theme.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              {selectedTheme === theme.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className={cn("w-5 h-5", theme.text)} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div>
        <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-4">Preview</h3>
        <div className={cn(
          "rounded-2xl p-6 border border-border/50",
          THEMES.find(t => t.id === selectedTheme)?.bg
        )}>
          <p className={cn(
            "text-lg",
            FONTS.find(f => f.id === selectedFont)?.className,
            THEMES.find(t => t.id === selectedTheme)?.text
          )}>
            This is how your page will look with the selected font and theme.
          </p>
        </div>
      </div>
    </div>
  );
}
