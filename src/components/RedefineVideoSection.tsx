import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { StoreSettings } from '../types';
import { useResolvedMediaUrl } from '../services/storageService';

interface RedefineVideoSectionProps {
  storeSettings?: StoreSettings | null;
}

export default function RedefineVideoSection({ storeSettings }: RedefineVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const rawVideoUrl = storeSettings?.redefineVideoUrl || '';
  const rawPosterUrl = storeSettings?.redefineVideoPosterUrl || '';
  const heading = storeSettings?.redefineVideoHeading || 'Redefine Yourself';
  const enabled = storeSettings?.redefineVideoEnabled !== false;

  const resolvedVideoUrl = useResolvedMediaUrl(rawVideoUrl);
  const resolvedPosterUrl = useResolvedMediaUrl(rawPosterUrl);

  // Wait until storeSettings has loaded from database; if disabled or removed completely, hide section
  if (!storeSettings || !enabled) {
    return null;
  }

  if (!rawVideoUrl && !rawPosterUrl) {
    return null;
  }

  const handleTogglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FDFBF7]">
      <div className="max-w-md sm:max-w-xl mx-auto px-4 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6 tracking-tight">
          {heading}
        </h2>

        {/* Video Card with Play Button */}
        <div
          onClick={resolvedVideoUrl ? handleTogglePlay : undefined}
          className="relative w-full aspect-[9/14] sm:aspect-[9/13] rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 group cursor-pointer"
        >
          {resolvedVideoUrl ? (
            <>
              <video
                ref={videoRef}
                src={resolvedVideoUrl}
                poster={resolvedPosterUrl || undefined}
                playsInline
                loop
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-cover object-center"
              />

              {!isPlaying && (
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              )}

              {/* Play / Pause Overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                }`}
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-black flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-all">
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-black" />
                  ) : (
                    <Play className="w-7 h-7 fill-black ml-1" />
                  )}
                </div>
              </div>

              {/* Mute / Unmute Button while playing */}
              {isPlaying && (
                <button
                  type="button"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}
            </>
          ) : (
            <>
              {resolvedPosterUrl && (
                <img
                  src={resolvedPosterUrl}
                  alt={heading}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-black flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-all">
                  <Play className="w-7 h-7 fill-black ml-1" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
