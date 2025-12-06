import { cn } from "@/lib/utils";

interface ParallaxScrollProps {
  images: Array<{
    id: string;
    url: string;
    title?: string;
    category?: string;
  }>;
  className?: string;
}

export const ParallaxScroll = ({ images, className }: ParallaxScrollProps) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div
            key={`gallery-${img.id || idx}`}
            className="relative group aspect-square"
          >
            <img
              src={img.url}
              className="w-full h-full object-cover rounded-xl shadow-lg"
              alt={img.title || "Gallery image"}
            />
            {img.title && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-3">
                <div>
                  <p className="text-white font-semibold text-sm">{img.title}</p>
                  {img.category && (
                    <span className="text-white/70 text-xs">{img.category}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
