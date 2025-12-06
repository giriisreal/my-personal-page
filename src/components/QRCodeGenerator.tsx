import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, QrCode, Loader2 } from "lucide-react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  profileUrl: string;
  avatarUrl?: string | null;
  isPremium: boolean;
}

const COLOR_PRESETS = [
  { fg: "#000000", bg: "#ffffff", label: "Classic" },
  { fg: "#16a34a", bg: "#ffffff", label: "Green" },
  { fg: "#3b82f6", bg: "#ffffff", label: "Blue" },
  { fg: "#7c3aed", bg: "#ffffff", label: "Purple" },
  { fg: "#f43f5e", bg: "#ffffff", label: "Rose" },
  { fg: "#ffffff", bg: "#0f172a", label: "Dark" },
];

export function QRCodeGenerator({ profileUrl, avatarUrl, isPremium }: QRCodeGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [rounded, setRounded] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQR();
  }, [profileUrl, foregroundColor, backgroundColor, rounded, showLogo, avatarUrl]);

  const generateQR = async () => {
    if (!profileUrl) return;
    setLoading(true);

    try {
      // Generate QR code to canvas
      const canvas = canvasRef.current;
      if (!canvas) return;

      const size = 400;
      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(canvas, profileUrl, {
        width: size,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        errorCorrectionLevel: showLogo && avatarUrl ? "H" : "M",
      });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Apply rounded corners to modules if enabled
      if (rounded) {
        // Get current image data and apply rounded effect
        const imageData = ctx.getImageData(0, 0, size, size);
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);
        ctx.putImageData(imageData, 0, 0);
      }

      // Add logo in center if enabled and avatar exists
      if (showLogo && avatarUrl && isPremium) {
        const logoSize = size * 0.2;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Draw white circle background
        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2 + 8, 0, Math.PI * 2);
        ctx.fill();

        // Load and draw logo
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();

          // Update data URL
          setQrDataUrl(canvas.toDataURL("image/png", 1.0));
        };
        logo.onerror = () => {
          setQrDataUrl(canvas.toDataURL("image/png", 1.0));
        };
        logo.src = avatarUrl;
      } else {
        setQrDataUrl(canvas.toDataURL("image/png", 1.0));
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `entrepage-qr-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (!isPremium) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <QrCode className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">QR Code Generator</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Generate custom QR codes with your branding. Premium feature.
        </p>
        <div className="aspect-square max-w-[200px] mx-auto bg-muted/50 rounded-xl flex items-center justify-center">
          <QrCode className="w-16 h-16 text-muted-foreground/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <QrCode className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">QR Code Generator</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            {loading ? (
              <div className="w-48 h-48 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-muted/20 rounded-xl">
                <QrCode className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <Button onClick={downloadQR} disabled={!qrDataUrl} className="gap-2">
            <Download className="w-4 h-4" />
            Download PNG
          </Button>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Color presets */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Color Preset</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setForegroundColor(preset.fg);
                    setBackgroundColor(preset.bg);
                  }}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    foregroundColor === preset.fg && backgroundColor === preset.bg
                      ? "border-primary scale-110"
                      : "border-transparent"
                  }`}
                  style={{ background: preset.bg }}
                  title={preset.label}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto"
                    style={{ background: preset.fg }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">QR Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-10 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Background</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Rounded corners</Label>
              <Switch checked={rounded} onCheckedChange={setRounded} />
            </div>
            {avatarUrl && (
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show logo in center</Label>
                <Switch checked={showLogo} onCheckedChange={setShowLogo} />
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            High-resolution 400×400px PNG download
          </p>
        </div>
      </div>
    </div>
  );
}
