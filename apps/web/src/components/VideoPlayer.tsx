import { useRef, useState, useEffect } from "react";
import { Icon } from "./Icon.js";

type VideoPlayerProps = {
  src: string;
  onStart?: () => void;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  savedPosition?: number; // Position sauvegardée en secondes
};

// Fonction pour extraire l'ID d'une vidéo YouTube depuis différentes URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*&v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Fonction pour vérifier si l'URL est YouTube
function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

export function VideoPlayer({ src, onStart, onComplete, onProgress, savedPosition }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const isYouTube = isYouTubeUrl(src);
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(src) : null;
  const youtubeEmbedUrl = youtubeVideoId 
    ? `https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1${typeof window !== 'undefined' ? `&origin=${window.location.origin}` : ''}${savedPosition ? `&start=${Math.floor(savedPosition)}` : ''}`
    : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Restaurer la position sauvegardée
    if (savedPosition && savedPosition > 0) {
      video.currentTime = savedPosition;
    }

    const handlePlay = () => {
      setIsPlaying(true);
      onStart?.();
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (video.duration) {
        const value = Math.round((video.currentTime / video.duration) * 100);
        setProgress(value);
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
        onProgress?.(value);
        if (value === 100) {
          onComplete?.();
        }
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (savedPosition && savedPosition > 0) {
        video.currentTime = savedPosition;
      }
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onStart, onComplete, onProgress, savedPosition]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    video.currentTime = percent * video.duration;
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const remainingTime = duration - currentTime;

  // Si c'est une vidéo YouTube, utiliser un iframe
  if (isYouTube && youtubeEmbedUrl) {
    return (
      <div ref={containerRef} className="video-shell">
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
          <iframe
            ref={iframeRef}
            src={youtubeEmbedUrl}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Vidéo YouTube"
          />
        </div>
        <div className="training-meta__row" style={{ marginTop: "0.5rem", justifyContent: "space-between" }}>
          <div>
            <strong>Vidéo YouTube</strong>
            {savedPosition && savedPosition > 0 && (
              <span className="muted" style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}>
                (Reprise à {formatTime(savedPosition)})
              </span>
            )}
          </div>
          <a 
            href={src} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ fontSize: "0.85rem" }}
          >
            Ouvrir sur YouTube
          </a>
        </div>
      </div>
    );
  }

  // Sinon, utiliser le lecteur vidéo HTML5 standard
  return (
    <div ref={containerRef} className="video-shell">
      <video ref={videoRef} className="video-shell__player" preload="metadata">
        <source src={src} />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
      <div className="video-controls">
        <button type="button" className="video-control-btn" onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Lecture"}>
          <Icon name={isPlaying ? "pause" : "play"} size={18} />
        </button>
        <div className="video-seek-bar" onClick={handleSeek}>
          <div className="video-progress">
            <div className="video-progress__value" style={{ width: `${progress}%` }} aria-valuenow={progress} />
          </div>
        </div>
        <div className="video-controls__time">
          <span className="video-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          {remainingTime > 0 && (
            <span className="video-time-remaining" style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>
              -{formatTime(remainingTime)}
            </span>
          )}
        </div>
        <div className="video-controls__right">
          <select
            className="video-speed-select"
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            aria-label="Vitesse de lecture"
          >
            {speeds.map((speed) => (
              <option key={speed} value={speed}>
                {speed}x
              </option>
            ))}
          </select>
          <button type="button" className="video-control-btn" onClick={toggleFullscreen} aria-label="Plein écran">
            <Icon name={isFullscreen ? "fullscreenExit" : "fullscreen"} size={18} />
          </button>
        </div>
      </div>
      <div className="training-meta__row" style={{ marginTop: "0.5rem", justifyContent: "space-between" }}>
        <div>
          <strong>Progression</strong>
          <span style={{ marginLeft: "0.5rem" }}>{progress}%</span>
        </div>
        {savedPosition && savedPosition > 0 && (
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            Reprise à {formatTime(savedPosition)}
          </span>
        )}
      </div>
    </div>
  );
}

