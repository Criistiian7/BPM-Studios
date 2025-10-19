import { useState, useEffect, useRef } from "react";

export const useTrackNavigation = (tracks: any[]) => {
  const [autoPlayTrackId, setAutoPlayTrackId] = useState<string | null>(null);
  const trackRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Reset autoPlayTrackId after it's been used
  useEffect(() => {
    if (autoPlayTrackId) {
      const timer = setTimeout(() => {
        setAutoPlayTrackId(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlayTrackId]);

  const scrollToTrack = (trackId: string) => {
    setTimeout(() => {
      trackRefs.current[trackId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const handleNext = (currentIndex: number, wasPlaying: boolean) => {
    if (currentIndex < tracks.length - 1) {
      const nextTrackId = tracks[currentIndex + 1].id;
      if (wasPlaying) {
        setAutoPlayTrackId(nextTrackId);
      }
      scrollToTrack(nextTrackId);
    }
  };

  const handlePrevious = (currentIndex: number, wasPlaying: boolean) => {
    if (currentIndex > 0) {
      const prevTrackId = tracks[currentIndex - 1].id;
      if (wasPlaying) {
        setAutoPlayTrackId(prevTrackId);
      }
      scrollToTrack(prevTrackId);
    }
  };

  return {
    autoPlayTrackId,
    trackRefs,
    handleNext,
    handlePrevious,
  };
};

