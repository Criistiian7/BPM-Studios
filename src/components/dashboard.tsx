import React, { useEffect, useState } from "react";
import { Container, Card, Button, Table } from "react-bootstrap";
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
    <Container>
      <h2>Dashboard</h2>
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Upload New Track</Card.Title>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Body>
          <Card.Title>My Tracks</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => (
                <tr key={track.id}>
                  <td>{track.title}</td>
                  <td>{track.genre}</td>
                  <td>{track.status}</td>
                  <td>
                    <Button
                      variant="primary"
                      onClick={() => handlePlayTrack(track)}
                    >
                      Play
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {currentTrack && (
        <Card className="mt-4">
          <Card.Body>
            <Card.Title>Now Playing: {currentTrack.title}</Card.Title>
            <AudioPlayer
              src={currentTrack.audioURL}
              onPlay={() => console.log("onPlay")}
            />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default Dashboard;
