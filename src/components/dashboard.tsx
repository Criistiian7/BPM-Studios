import React, { useEffect, useState } from "react";
import UploadTrack from "./uploadTrack";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import type { Track } from "../types/track";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      if (user) {
        const tracksCollectionRef = collection(db, "tracks");
        const q = query(tracksCollectionRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const tracksData: Track[] = [];
        querySnapshot.forEach((doc) => {
          tracksData.push({ id: doc.id, ...doc.data() } as Track);
        });
        setTracks(tracksData);
      }
    };
    fetchTracks();
  }, [user]);

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="bg-white shadow-md rounded p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">Upload New Track</h3>7
        <UploadTrack />
      </div>

      <div className="bg-white shadow-md rounded p-4">
        <h3 className="text-xl font-semibold mb-2">My Tracks</h3>
        <table className="table-auto w--full">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Genre</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr key={track.id}>
                <td className="border px-4 py-2">{track.title}</td>
                <td className="border px-4 py-2">{track.genre}</td>
                <td className="border px-4 py-2">{track.status}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handlePlayTrack}
                  >
                    Play
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentTrack && (
        <div className="bg-white shadow-md rounded p-4 mt-4">
          <h3 className="text-xl font-semibold mb-2">
            Now Playing: {currentTrack.title}
          </h3>
          <AudioPlayer
            src={currentTrack.audioURL}
            onPlay={() => console.log("onPlay")}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
