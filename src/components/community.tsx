import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { UserProfile } from "../types/user";
import { FaMapMarkerAlt, FaMicrophone } from 'react-icons/fa';
import UserProfileDetails from './user-profile-details';


function Community() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
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
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();
  }, [genreFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleGenreFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenreFilter(e.target.value);
  };

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
  }; 

  const handleCloseModal = () => {
    setSelectedUser(null); // Inchide modulul
  };

  const filteredUsers = users.filter(
    (user) =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Community</h2>

      {/* Filtrul de cautare  */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search artists, producers, or studios..."
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus: shadow-outline"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Filtru pentru genul muzical */}
      <div className="mb-6">
        <label
          htmlFor="genre"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Genre:
        </label>
        <select
          id="genre"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray leading-tight focus:outline-none focus:shadow-outline"
          value={genreFilter}
          onChange={handleGenreFilterChange}
        >
          <option value="">All Genres</option>
          <option value="Hip Hop">Hip Hop</option>
          <option value="Pop">Pop</option>
          <option value="Rock">Rock</option>
          <option value="Jazz">Jazz</option>
          <option value="Electronic">Electronic</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.uid} className="bg-white shadow-md rounded p-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {user.displayName}
            </h3>
            <p className="text-gray-600 mb-3">{user.description}</p>

            {/* Afiseaza locatia */}
            <div className="flex items-center text-gray-500 mb-2">
              <FaMapMarkerAlt className="mr-1" />
              <span>{user.location || 'Unknown'}</span>
            </div>

          {/* Afiseaza genul muzical */}
          {user.genre && (
            <div className="flex items-center text-gray-500 mb-2">
              <FaMicrophone className="mr-1"/>
              <span>{user.genre}</span>
            </div>
          )}

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
              onClick={() => handleUserClick(user)}
              >
              Connect
            </button>
          </div>
        ))}
      </div>

      {/* Afiseaza modulul */}
      {selectedUser && (
        <UserProfileDetails user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default Community;
