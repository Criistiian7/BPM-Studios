import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { FILE_SIZE_LIMITS, ERROR_MESSAGES } from "../constants";

interface UseImageUploadOptions {
  path: string; // e.g., 'avatars' or 'studios'
  userId: string;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const useImageUpload = (options: UseImageUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file size
      if (file.size > FILE_SIZE_LIMITS.IMAGE) {
        const errorMsg = `${ERROR_MESSAGES.FILE_TOO_LARGE}. Maxim 5MB.`;
        setError(errorMsg);
        options.onError?.(errorMsg);
        return null;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        const errorMsg = ERROR_MESSAGES.INVALID_IMAGE;
        setError(errorMsg);
        options.onError?.(errorMsg);
        return null;
      }

      setProgress(30);

      // Upload to storage
      const storageRef = ref(
        storage,
        `${options.path}/${options.userId}/${Date.now()}_${file.name}`
      );

      const snapshot = await uploadBytes(storageRef, file);
      setProgress(70);

      const url = await getDownloadURL(snapshot.ref);
      setProgress(100);

      setImageUrl(url);
      options.onSuccess?.(url);

      return url;
    } catch (err: any) {
      const errorMsg = `${ERROR_MESSAGES.UPLOAD_FAILED}: ${
        err.message || "Încearcă din nou"
      }`;
      setError(errorMsg);
      options.onError?.(errorMsg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploading,
    progress,
    error,
    imageUrl,
  };
};

