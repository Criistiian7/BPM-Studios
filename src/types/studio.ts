import type { AccountType } from "./user";

export interface Studio {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  photoURL: string | null;
  email?: string;
  location?: string;
  phoneNumber?: string;
  socialLinks?: {
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
  };
  memberIds: string[];
  trackCount: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudioMember {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  accountType: AccountType;
  joinedAt: string;
}
