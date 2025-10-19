# 🔧 Ghid Practic de Refactorizare

**Start Date:** 19 Octombrie 2025  
**Estimated Duration:** 4-6 săptămâni  
**Difficulty:** Medium to High

---

## 📋 CHECKLIST DE ÎNCEPUT

Înainte de a începe refactorizarea:

- [ ] Creează backup branch: `git checkout -b backup/pre-refactor`
- [ ] Creează working branch: `git checkout -b refactor/code-optimization`
- [ ] Documentează toate modificările în acest fișier
- [ ] Testează manual aplicația după fiecare refactorizare majoră
- [ ] Commit frecvent cu mesaje descriptive

---

## 🚀 FAZA 1: COMPONENTE COMUNE (Ziua 1-3)

### Pasul 1.1: LoadingSpinner Component

**Fișier:** `src/components/common/LoadingSpinner.tsx`

```typescript
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message = "Se încarcă...",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  const Spinner = (
    <div className="text-center">
      <div className={`relative ${sizeClasses[size]} mx-auto mb-4`}>
        <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 dark:border-t-pink-500 animate-spin"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {Spinner}
      </div>
    );
  }

  return Spinner;
};
```

**Înlocuiește în:**

1. `App.tsx` - liniile 16-26 și 32-34
2. `Studio.tsx` - liniile 306-313
3. `Dashboard.tsx` - liniile 11-18
4. `UserProfile.tsx` - liniile 193-198
5. `ProfileEdit.tsx` - liniile 239-247

**Exemplu de utilizare:**

```typescript
// ❌ ÎNAINTE:
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// ✅ DUPĂ:
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

if (loading) {
  return <LoadingSpinner fullScreen />;
}
```

---

### Pasul 1.2: Avatar Component

**Fișier:** `src/components/common/Avatar.tsx`

```typescript
import React from "react";
import { getInitials } from "@/utils/formatters";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md",
  className = "",
  fallbackIcon,
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-2xl",
    xl: "w-32 h-32 text-4xl",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-gray-200 dark:border-gray-700 ${className}`}
    >
      {fallbackIcon || getInitials(name)}
    </div>
  );
};
```

**Utils Helper:**
`src/utils/formatters.ts`

```typescript
export const getInitials = (name: string, maxChars: number = 2): string => {
  if (!name || name.trim() === "") return "?";

  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, maxChars)
    .join("")
    .toUpperCase();
};

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};
```

**Șterge funcțiile duplicate:**

1. `Studio.tsx:296-303` - șterge `getInitials`
2. `Navbar.tsx:80-87` - șterge `getInitials`
3. `ProfileEdit.tsx:251-258` - șterge `getInitials`

**Utilizare:**

```typescript
// ❌ ÎNAINTE:
{
  user.avatar ? (
    <img
      src={user.avatar}
      alt={user.name}
      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
      {getInitials(user.name)}
    </div>
  );
}

// ✅ DUPĂ:
<Avatar src={user.avatar} name={user.name} size="sm" />;
```

---

### Pasul 1.3: Modal Component

**Fișier:** `src/components/common/Modal.tsx`

```typescript
import React from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
  footer,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-custom">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### Pasul 1.4: Button Component

**Fișier:** `src/components/common/Button.tsx`

```typescript
import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "rounded-lg font-medium transition-all focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2";

  const variantClasses = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
    secondary:
      "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
```

---

## 🔧 FAZA 2: CUSTOM HOOKS (Ziua 4-7)

### Pasul 2.1: useImageUpload Hook

**Fișier:** `src/hooks/useImageUpload.ts`

```typescript
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = "Fișierul este prea mare. Maxim 5MB.";
        setError(errorMsg);
        options.onError?.(errorMsg);
        return null;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        const errorMsg = "Te rog selectează o imagine validă.";
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
      const errorMsg = `Eroare la încărcarea imaginii: ${
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
```

**Utilizare în ProfileEdit.tsx:**

```typescript
// ❌ ÎNAINTE: liniile 118-164
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  if (file.size > 5 * 1024 * 1024) {
    setMessage({ type: "error", text: "Fișierul este prea mare. Maxim 5MB." });
    return;
  }
  // ... rest of code
};

// ✅ DUPĂ:
import { useImageUpload } from "@/hooks/useImageUpload";

const { uploadImage, uploading } = useImageUpload({
  path: "avatars",
  userId: user.id,
  onSuccess: (url) => {
    setPhotoURL(url);
    setMessage({
      type: "success",
      text: "Imaginea a fost încărcată cu succes!",
    });
  },
  onError: (error) => {
    setMessage({ type: "error", text: error });
  },
});

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const url = await uploadImage(file);
  if (url) {
    // Update Firestore și Auth
    const userRef = doc(db, "users", user.id);
    await setDoc(userRef, { photoURL: url }, { merge: true });

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: url });
    }
  }
};
```

---

### Pasul 2.2: useTrackUpload Hook

**Fișier:** `src/hooks/useTrackUpload.ts`

```typescript
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import { createTrackFirestore } from "@/firebase/api";

const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

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
  studioName?: string;
  studioId?: string;
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
        throw new Error("Titlul este obligatoriu");
      }

      if (params.audioFile.size > MAX_AUDIO_SIZE) {
        throw new Error("Fișierul audio este prea mare. Maxim 50MB.");
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
      const errorMsg = err.message || "Eroare la încărcarea track-ului";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return { uploadTrack, uploading, progress, error };
};
```

**Utilizare în MyTracks.tsx:**

```typescript
// ❌ ÎNAINTE: liniile 102-151
const handleUploadTrack = async () => {
  if (!user || !uploadAudioFile || !uploadTitle.trim()) {
    showWarning("Te rog completează titlul și selectează un fișier audio.");
    return;
  }

  setUploadingTrack(true);
  try {
    const storageRef = ref(
      storage,
      `tracks/${user.id}/${Date.now()}_${uploadAudioFile.name}`
    );
    const snapshot = await uploadBytes(storageRef, uploadAudioFile);
    const audioURL = await getDownloadURL(snapshot.ref);
    // ... rest
  } catch (error) {
    // ...
  }
};

// ✅ DUPĂ:
import { useTrackUpload } from "@/hooks/useTrackUpload";

const { uploadTrack, uploading: uploadingTrack } = useTrackUpload();

const handleUploadTrack = async () => {
  if (!user || !uploadAudioFile || !uploadTitle.trim()) {
    showWarning("Te rog completează titlul și selectează un fișier audio.");
    return;
  }

  try {
    await uploadTrack({
      title: uploadTitle,
      description: uploadDescription,
      genre: uploadGenre,
      status: uploadStatus,
      audioFile: uploadAudioFile,
      userId: user.id,
      userName: user.name || user.email || "Unknown",
      collaborators: hasCollaborators ? selectedCollaborators : [],
      uploadedByStudio: false,
    });

    // Reload tracks
    const data = await fetchTracksByOwner(user.id);
    setTracks(data);

    // Reset form
    setUploadTitle("");
    setUploadDescription("");
    setUploadGenre("");
    setUploadStatus("Work in Progress");
    setUploadAudioFile(null);
    setHasCollaborators(false);
    setSelectedCollaborators([]);
    setShowUploadModal(false);

    showSuccess("Track-ul a fost încărcat cu succes!");
  } catch (error) {
    showError("Eroare la încărcarea track-ului. Te rog încearcă din nou.");
  }
};
```

---

### Pasul 2.3: useTrackNavigation Hook

**Fișier:** `src/hooks/useTrackNavigation.ts`

```typescript
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
```

**Utilizare:**

```typescript
// ✅ În Studio.tsx, MyTracks.tsx, UserProfile.tsx:
import { useTrackNavigation } from "@/hooks/useTrackNavigation";

const { autoPlayTrackId, trackRefs, handleNext, handlePrevious } =
  useTrackNavigation(tracks);

// Apoi folosește în AudioPlayer:
<AudioPlayer
  // ... alte props
  onNext={(wasPlaying) => handleNext(index, wasPlaying)}
  onPrevious={(wasPlaying) => handlePrevious(index, wasPlaying)}
  autoPlay={autoPlayTrackId === track.id}
  hasNext={index < tracks.length - 1}
  hasPrevious={index > 0}
/>;
```

---

## 🏗️ FAZA 3: REFACTORIZARE STUDIO.TSX (Ziua 8-12)

### Structura nouă:

```
src/pages/Studio/
  ├── index.tsx                 # Main orchestrator
  ├── StudioHeader.tsx          # Avatar, name, description, stats
  ├── StudioTabs.tsx            # Tabs component
  ├── TracksTab.tsx             # Tracks list
  ├── MembersTab.tsx            # Members list
  ├── modals/
  │   ├── EditStudioModal.tsx
  │   ├── UploadTrackModal.tsx
  │   └── index.ts
  └── hooks/
      ├── useStudioData.ts
      └── index.ts
```

### Pasul 3.1: Creează useStudioData Hook

**Fișier:** `src/pages/Studio/hooks/useStudioData.ts`

```typescript
import { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import type { Studio as StudioType, StudioMember } from "@/types/studio";
import type { Track } from "@/types/track";

export const useStudioData = (userId: string | undefined) => {
  const [studio, setStudio] = useState<StudioType | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [members, setMembers] = useState<StudioMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadStudioData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load studio
        const studioRef = doc(db, "studios", userId);
        const studioSnap = await getDoc(studioRef);

        if (studioSnap.exists()) {
          const studioData = {
            id: studioSnap.id,
            ...studioSnap.data(),
          } as StudioType;
          setStudio(studioData);

          // Load tracks
          const tracksRef = collection(db, "tracks");
          const tracksQuery = query(tracksRef, where("userId", "==", userId));
          const tracksSnap = await getDocs(tracksQuery);
          const tracksData = tracksSnap.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Track)
          );
          setTracks(tracksData);

          // Load members (for now, just the owner)
          const memberData: StudioMember = {
            id: userId,
            uid: userId,
            displayName: studioData.ownerName || "Owner",
            email: studioData.ownerEmail || "",
            photoURL: studioData.photoURL || null,
            accountType: "producer",
            joinedAt: studioData.createdAt || new Date().toISOString(),
          };
          setMembers([memberData]);
        } else {
          // Create default studio
          const newStudio: Partial<StudioType> = {
            ownerId: userId,
            name: `Studio ${userId.substring(0, 6)}`,
            description: "",
            photoURL: null,
            memberIds: [userId],
            trackCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(studioRef, newStudio);
          setStudio({ id: userId, ...newStudio } as StudioType);
        }
      } catch (err: any) {
        setError(err.message || "Error loading studio data");
        console.error("Error loading studio:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStudioData();
  }, [userId]);

  const refreshStudio = async () => {
    if (!userId) return;

    const studioRef = doc(db, "studios", userId);
    const studioSnap = await getDoc(studioRef);
    if (studioSnap.exists()) {
      setStudio({ id: studioSnap.id, ...studioSnap.data() } as StudioType);
    }
  };

  const refreshTracks = async () => {
    if (!userId) return;

    const tracksRef = collection(db, "tracks");
    const tracksQuery = query(tracksRef, where("userId", "==", userId));
    const tracksSnap = await getDocs(tracksQuery);
    const tracksData = tracksSnap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Track)
    );
    setTracks(tracksData);
  };

  return {
    studio,
    tracks,
    members,
    loading,
    error,
    setStudio,
    setTracks,
    refreshStudio,
    refreshTracks,
  };
};
```

### Pasul 3.2: Creează StudioHeader Component

**Fișier:** `src/pages/Studio/StudioHeader.tsx`

```typescript
import React from "react";
import {
  FiMusic,
  FiUsers,
  FiMapPin,
  FiPhone,
  FiMail,
  FiEdit2,
  FiUpload,
} from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import type { Studio } from "@/types/studio";
import type { StudioMember } from "@/types/studio";
import { Avatar } from "@/components/common/Avatar";

interface StudioHeaderProps {
  studio: Studio;
  members: StudioMember[];
  tracksCount: number;
  onEdit: () => void;
  onUpload: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  studio,
  members,
  tracksCount,
  onEdit,
  onUpload,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
      <div className="flex items-start justify-between gap-6">
        {/* Left: Avatar + Info */}
        <div className="flex items-start gap-6 flex-1">
          {/* Avatar */}
          <Avatar
            src={studio.photoURL}
            name={studio.name}
            size="xl"
            fallbackIcon={<FiMusic className="text-3xl" />}
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {studio.name}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {studio.description || "Fără descriere"}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {(studio as any).location && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <FiMapPin className="text-indigo-600 dark:text-indigo-400" />
                  <span>{(studio as any).location}</span>
                </div>
              )}
              {(studio as any).phoneNumber && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <FiPhone className="text-indigo-600 dark:text-indigo-400" />
                  <a
                    href={`tel:${(studio as any).phoneNumber}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {(studio as any).phoneNumber}
                  </a>
                </div>
              )}
              {(studio as any).email && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <FiMail className="text-indigo-600 dark:text-indigo-400" />
                  <a
                    href={`mailto:${(studio as any).email}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {(studio as any).email}
                  </a>
                </div>
              )}
            </div>

            {/* Social Media */}
            {((studio as any).socialLinks?.facebook ||
              (studio as any).socialLinks?.instagram ||
              (studio as any).socialLinks?.youtube) && (
              <div className="flex items-center gap-3 mb-4">
                {(studio as any).socialLinks?.facebook && (
                  <a
                    href={(studio as any).socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-[#1877F2] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    <FaFacebook className="text-xl" />
                  </a>
                )}
                {(studio as any).socialLinks?.instagram && (
                  <a
                    href={(studio as any).socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-[#E4405F] hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-lg transition-all"
                  >
                    <FaInstagram className="text-xl" />
                  </a>
                )}
                {(studio as any).socialLinks?.youtube && (
                  <a
                    href={(studio as any).socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-[#FF0000] hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <FaYoutube className="text-xl" />
                  </a>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiUsers className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">{members.length}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {members.length === 1 ? "membru" : "membri"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiMusic className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">{tracksCount}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {tracksCount === 1 ? "track" : "tracks"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onUpload}
            className="p-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
            title="Upload Track"
          >
            <FiUpload className="text-xl" />
          </button>

          <button
            onClick={onEdit}
            className="p-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
            title="Editează Studio"
          >
            <FiEdit2 className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Pasul 3.3: Studio/index.tsx (Main Component)

**Fișier:** `src/pages/Studio/index.tsx`

```typescript
import React, { useState } from "react";
import { useAuth } from "@/context/authContext";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StudioHeader } from "./StudioHeader";
import { StudioTabs } from "./StudioTabs";
import { TracksTab } from "./TracksTab";
import { MembersTab } from "./MembersTab";
import { EditStudioModal, UploadTrackModal } from "./modals";
import { useStudioData } from "./hooks/useStudioData";
import { useAlert } from "@/hooks/useAlert";
import AlertModal from "@/components/AlertModal";

const Studio: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { alert: alertState, showSuccess, showError, closeAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<"tracks" | "members">("tracks");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const {
    studio,
    tracks,
    members,
    loading: studioLoading,
    error,
    setStudio,
    setTracks,
    refreshStudio,
    refreshTracks,
  } = useStudioData(user?.id);

  if (authLoading || studioLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (user.accountType !== "producer")
    return <Navigate to="/profile" replace />;
  if (!studio) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto p-6">
        <StudioHeader
          studio={studio}
          members={members}
          tracksCount={tracks.length}
          onEdit={() => setShowEditModal(true)}
          onUpload={() => setShowUploadModal(true)}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <StudioTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tracksCount={tracks.length}
            membersCount={members.length}
          />

          <div className="p-6">
            {activeTab === "tracks" ? (
              <TracksTab
                tracks={tracks}
                studio={studio}
                user={user}
                onTracksChange={setTracks}
              />
            ) : (
              <MembersTab members={members} user={user} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditStudioModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        studio={studio}
        user={user}
        onSuccess={(updatedStudio) => {
          setStudio(updatedStudio);
          showSuccess("Studio-ul a fost actualizat cu succes!");
        }}
        onError={(error) => showError(error)}
      />

      <UploadTrackModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        studio={studio}
        members={members}
        user={user}
        onSuccess={() => {
          refreshTracks();
          showSuccess("Track-ul a fost încărcat cu succes!");
        }}
        onError={(error) => showError(error)}
      />

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
      />
    </div>
  );
};

export default Studio;
```

**Rezultat:** Studio.tsx a trecut de la **1,090 linii** la **~100 linii** 🎉

---

## 📊 TRACKING PROGRESS

### După fiecare fază, actualizează:

```markdown
## Progress Tracker

- [x] Faza 1: Componente Comune (Ziua 1-3)
  - [x] LoadingSpinner
  - [x] Avatar
  - [x] Modal
  - [x] Button
- [ ] Faza 2: Custom Hooks (Ziua 4-7)
  - [ ] useImageUpload
  - [ ] useTrackUpload
  - [ ] useTrackNavigation
- [ ] Faza 3: Refactorizare Studio.tsx (Ziua 8-12)
  - [ ] useStudioData hook
  - [ ] StudioHeader component
  - [ ] Studio/index.tsx
  - [ ] Modals separation
- [ ] Faza 4: Refactorizare MyTracks.tsx (Ziua 13-17)
- [ ] Faza 5: Refactorizare AudioPlayer.tsx (Ziua 18-22)
- [ ] Faza 6: Testing și Finalizare (Ziua 23-28)
```

---

## ✅ CHECKLIST FINAL

După fiecare refactorizare:

- [ ] Codul compilează fără erori
- [ ] Nu există console errors în browser
- [ ] Funcționalitatea există la fel ca înainte
- [ ] Testare manuală completă
- [ ] Code review
- [ ] Commit cu mesaj descriptiv
- [ ] Push la remote branch

---

**Happy Refactoring!** 🚀
