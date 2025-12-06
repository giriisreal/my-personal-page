import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
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
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: gridRef,
    offset: ["start start", "end start"],
  });

  const translateYFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateXFirst = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rotateFirst = useTransform(scrollYProgress, [0, 1], [0, -10]);

  const translateYThird = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateXThird = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const rotateThird = useTransform(scrollYProgress, [0, 1], [0, 10]);

  const third = Math.ceil(images.length / 3);
  const firstPart = images.slice(0, third);
  const secondPart = images.slice(third, 2 * third);
  const thirdPart = images.slice(2 * third);

  if (images.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("h-[500px] overflow-y-auto w-full scrollbar-hide", className)}
      ref={gridRef}
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-20 px-4">
        <div className="grid gap-4">
          {firstPart.map((img, idx) => (
            <motion.div
              style={{
                y: translateYFirst,
                x: translateXFirst,
                rotate: rotateFirst,
              }}
              key={`grid-1-${img.id || idx}`}
              className="relative group"
            >
              <img
                src={img.url}
                className="h-64 w-full object-cover rounded-xl shadow-lg"
                alt={img.title || "Gallery image"}
              />
              {img.title && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-4">
                  <div>
                    <p className="text-white font-semibold">{img.title}</p>
                    {img.category && (
                      <span className="text-white/70 text-sm">{img.category}</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="grid gap-4">
          {secondPart.map((img, idx) => (
            <motion.div key={`grid-2-${img.id || idx}`} className="relative group">
              <img
                src={img.url}
                className="h-64 w-full object-cover rounded-xl shadow-lg"
                alt={img.title || "Gallery image"}
              />
              {img.title && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-4">
                  <div>
                    <p className="text-white font-semibold">{img.title}</p>
                    {img.category && (
                      <span className="text-white/70 text-sm">{img.category}</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="grid gap-4 hidden lg:grid">
          {thirdPart.map((img, idx) => (
            <motion.div
              style={{
                y: translateYThird,
                x: translateXThird,
                rotate: rotateThird,
              }}
              key={`grid-3-${img.id || idx}`}
              className="relative group"
            >
              <img
                src={img.url}
                className="h-64 w-full object-cover rounded-xl shadow-lg"
                alt={img.title || "Gallery image"}
              />
              {img.title && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-4">
                  <div>
                    <p className="text-white font-semibold">{img.title}</p>
                    {img.category && (
                      <span className="text-white/70 text-sm">{img.category}</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
