import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { UserProfile } from "../types/user";

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        let q = collection(db, "users");
        if (genreFilter) {
          q = query(q, where("genre", "==", genreFilter));
        }
        const querySnapshot = await getDocs(q);
        const usersData: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        setUsers(usersData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [genreFilter]);

  return {
    users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    genreFilter,
    setGenreFilter,
  };
};
