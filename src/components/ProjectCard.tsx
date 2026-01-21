import { useState } from 'react';
import { RevenueProgressBar } from '@/components/RevenueProgressBar';
import { Play, Share2, Users, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomLink {
  id: string;
  title: string;
  url: string;
  status?: string;
  icon?: string;
  category?: string;
  size?: string;
  color?: string;
  text_color?: string;
  live_revenue?: number;
  demo_video_url?: string;
  pitch_video_url?: string;
}

interface StatusInfo {
  label: string;
  color: string;
}

interface ProjectCardProps {
  link: CustomLink;
  statusInfo: StatusInfo;
  linkColor: string;
  textColor: string;
  hasVideos: boolean;
}

const isImageUrl = (icon?: string) => icon?.startsWith('http') || icon?.startsWith('data:');

// Convert YouTube/Vimeo URLs to embed URLs
const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return `https://www.loom.com/embed/${loomMatch[1]}`;
  }
  
  return url;
};

export function ProjectCard({ link, statusInfo, linkColor, textColor, hasVideos }: ProjectCardProps) {
  const [activeTab, setActiveTab] = useState<'pitch' | 'demo'>('pitch');
  
  const pitchEmbedUrl = link.pitch_video_url ? getEmbedUrl(link.pitch_video_url) : null;
  const demoEmbedUrl = link.demo_video_url ? getEmbedUrl(link.demo_video_url) : null;
  
  // Determine which tab to show by default
  const defaultTab = pitchEmbedUrl ? 'pitch' : 'demo';
  const currentTab = activeTab === 'pitch' && pitchEmbedUrl ? 'pitch' : demoEmbedUrl ? 'demo' : 'pitch';
  const currentVideoUrl = currentTab === 'pitch' ? pitchEmbedUrl : demoEmbedUrl;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: linkColor }}
            >
              {isImageUrl(link.icon) ? (
                <img src={link.icon} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-2xl">{link.icon || '🚀'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900">
                {link.title || 'Untitled'}
              </h3>
              <p className="text-sm text-gray-500">
                {link.url ? link.url.replace(/^https?:\/\//, '').split('/')[0] : 'No description'}
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              style={{ backgroundColor: linkColor, color: textColor }}
            >
              <ExternalLink className="w-4 h-4" />
              Visit
            </a>
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Status Badge & Category */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          {link.category && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {link.category}
            </span>
          )}
        </div>

        {/* Revenue Progress Bar */}
        {link.live_revenue !== null && link.live_revenue !== undefined && (
          <div className="mt-4 bg-gray-50 rounded-lg p-3">
            <RevenueProgressBar 
              revenue={link.live_revenue} 
              color={linkColor}
            />
          </div>
        )}
      </div>
      
      {/* Video Section */}
      {hasVideos && (
        <div className="border-t border-gray-100">
          {/* Video Tabs */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-100">
            {pitchEmbedUrl && (
              <button
                onClick={() => setActiveTab('pitch')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentTab === 'pitch'
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Elevator Pitch
              </button>
            )}
            {demoEmbedUrl && (
              <button
                onClick={() => setActiveTab('demo')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentTab === 'demo'
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Demo Video
              </button>
            )}
            <div className="flex-1" />
            <button className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2 transition-colors">
              <Users className="w-4 h-4" />
              Meet the Team
            </button>
          </div>
          
          {/* Video Player */}
          {currentVideoUrl && (
            <div className="aspect-video w-full bg-black">
              <iframe
                src={currentVideoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentTab === 'pitch' ? 'Elevator Pitch' : 'Demo Video'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}