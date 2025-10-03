import React, { useState } from "react";
import { auth, db } from "../firebase";
import storage from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Container, Form, Button, ProgressBar } from "react-bootstrap";
import type { Track } from "../types/track";

function UploadTrack() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Track["status"]>("Work in Progress");
  const [genre, setGenre] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }

  if (!file.type.startsWith('audio/')) {
    setUploadError('Please upload an audio file.');
    setAudioFile(null);
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    setUploadError('File size must be less than 10MB.');
    setAudioFile(null);
    return;
  }
 
  setAudioFile(file);
  setUploadError(null);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !user) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `tracks/${user.uid}/${audioFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, audioFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setUploadError(error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const tracksCollectionRef = collection(db, "tracks");
          await addDoc(tracksCollectionRef, {
            userId: user.uid,
            title: title,
            description,
            status: status,
            genre: genre,
            audioURL: downloadURL,
            createdAt: serverTimestamp(),
          });

          setTitle("");
          setDescription("");
          setStatus("Work in Progress");
          setGenre("");
          setAudioFile(null);
          setUploading(false);
          setUploadProgress(0);
          setUploadSuccess(true); 
          alert("Track uploaded successfully");
        }
      );
    } catch (error: any) {
      console.error("Error uploading track", error);
      alert("Error uploading track" + error.message);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Container>
      <h2>Upload Track</h2>
      <Form onSubmit={handleSubmit}>
        {uploadError && <div className="alert alert-danger">{uploadError}</div>}{" "}
        {uploading && (
          <>
            <ProgressBar
              now={uploadProgress}
              label={`${uploadProgress.toFixed(2)}%`}
            />
          </>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Control
            as="select"
            value={status}
            onChange={(e) => setStatus(e.target.value as Track["status"])}
            required
          >
            <option value="Work in Progress">Work in Progress</option>
            <option value="Pre-Release">Pre-Release</option>
            <option value="Release">Release</option>
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Genre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Audio File</Form.Label>
          <Form.Control
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </Form>
    </Container>
  );
}

export default UploadTrack;
