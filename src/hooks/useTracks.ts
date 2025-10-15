import { useState, useEffect, useCallback } from 'react';
import { fetchTracksByOwner } from '../firebase/api';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Track {
  id: string;
  title: string;
  description?: string;
  genre?: string;
  status?: string;
  audioURL?: string;
  ownerId: string;
  createdAt?: any;
}

export const useTracks = (ownerId?: string) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    if (!ownerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchTracksByOwner(ownerId);
      setTracks(data);
    } catch (err) {
      setError("Eroare la încărcarea track-urilor");
      console.error("Error fetching tracks:", err);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const deleteTrack = async (trackId: string) => {
    try {
      await deleteDoc(doc(db, "tracks", trackId));
      setTracks(prev => prev.filter(t => t.id !== trackId));
    } catch (err) {
      console.error("Error deleting track:", err);
      throw new Error("Eroare la ștergerea track-ului");
    }
  };

  const addTrack = (newTrack: Track) => {
    setTracks(prev => [newTrack, ...prev]);
  };

  return { 
    tracks, 
    loading, 
    error, 
    refetch: fetchTracks, 
    deleteTrack,
    addTrack,
    trackCount: tracks.length
  };
};