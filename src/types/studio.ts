export interface Studio {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  photoURL: string | null;
  memberIds: string[];
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudioMember {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  accountType: "producer" | "artist";
  joinedAt: string;
}