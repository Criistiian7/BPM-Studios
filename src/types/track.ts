export interface Track {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: "Work in Progress" | "Pre-Release" | "Release";
  genre: string;
  audioURL: string;
  createdAt: string;
}
