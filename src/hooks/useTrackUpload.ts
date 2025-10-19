import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { createTrackFirestore } from "../firebase/api";
import { FILE_SIZE_LIMITS, ERROR_MESSAGES } from "../constants";

interface UploadTrackParams {
  title: string;
  description?: string;
  genre?: string;
  status: "Work in Progress" | "Pre-Release" | "Release";
  audioFile: File;
  userId: string;
  userName: string;
  collaborators?: string[];
  uploadedByStudio?: boolean;
  studioName?: string | null;
  studioId?: string | null;
}

export const useTrackUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadTrack = async (params: UploadTrackParams) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate
      if (!params.title.trim()) {
        throw new Error(ERROR_MESSAGES.REQUIRED_FIELD);
      }

      if (params.audioFile.size > FILE_SIZE_LIMITS.AUDIO) {
        throw new Error(`${ERROR_MESSAGES.FILE_TOO_LARGE}. Maxim 50MB.`);
      }

      setProgress(10);

      // Upload audio to storage
      const storageRef = ref(
        storage,
        `tracks/${params.userId}/${Date.now()}_${params.audioFile.name}`
      );

      const snapshot = await uploadBytes(storageRef, params.audioFile);
      setProgress(50);

      const audioURL = await getDownloadURL(snapshot.ref);
      setProgress(70);

      // Create Firestore document
      const track = await createTrackFirestore({
        title: params.title.trim(),
        description: params.description?.trim() || "",
        genre: params.genre?.trim() || "",
        status: params.status,
        audioURL,
        ownerId: params.userId,
        ownerName: params.userName,
        collaborators: params.collaborators || [],
        uploadedByStudio: params.uploadedByStudio || false,
        studioName: params.studioName || null,
        studioId: params.studioId || null,
      });

      setProgress(100);
      return track;
    } catch (err: any) {
      const errorMsg = err.message || ERROR_MESSAGES.UPLOAD_FAILED;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return { uploadTrack, uploading, progress, error };
};

