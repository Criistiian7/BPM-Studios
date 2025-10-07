import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { UserProfile } from "../types/user";
import { FaMapMarkedAlt, FaMicrophone } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import UserProfileDetails from "./user-profile-details";

interface ConnectionModalProps {
  user: UserProfile;
  onClose: () => void;
  onConnect: (role: string) => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  user,
  onClose,
  onConnect,
}) => {
  const [selectedRole, setSelectedRole] = useState("");

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          Connect with {user.displayName}
        </h2>
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Select Role:
          </label>
          <select
            id="role"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            <option value="">Select Role</option>
            <option value="Artist">Artist</option>
            <option value="Producer">Producer</option>
            <option value="Studios">Studios</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
            onClick={() => {
              if (selectedRole) {
                onConnect(selectedRole);
              } else {
                alert("Please select a role before connecting.");
              }
            }}
          >
            Connect
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

function Community() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setTypeFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectingUser, setConnectingUser] = useState<UserProfile | null>(
    null
  );

  const [currentUser] = useAuthState(auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = genreFilter
          ? query(usersRef, where("genre", "==", genreFilter))
          : usersRef;
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

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const handleCloseModal = () => {
    setSelectedUser(null); // Inchide modulul
  };

  const handleConnectClick = (user: UserProfile) => {
    setConnectingUser(user);
    setShowConnectionModal(true);
  };

  const handleCloseConnectionModal = () => {
    setShowConnectionModal(false);
    setConnectingUser(null);
  };

  const handleConnect = async (role: string) => {
    if (!currentUser) {
      alert("You must be logged in to connect.");
    }

    if (!connectingUser) {
      alert("No user selected to connect with.");
      return;
    }

    try {
      await addDoc(collection(db, "connectionRequests"), {
        senderId: currentUser?.uid || "",
        receiverId: connectingUser.uid,
        role: role,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("Connection request sent!");
      handleCloseConnectionModal();
    } catch (error: any) {
      console.error("Error sending connection request: ", error);
      alert("Failed to send connection request: " + error.message);
    }
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
          User type:
        </label>
        <select
          id="type"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray leading-tight focus:outline-none focus:shadow-outline"
          value={genreFilter}
          onChange={handleTypeFilterChange}
        >
          <option value="Artist">Artist</option>
          <option value="Produces">Producer</option>
          <option value="Studio">Studio</option>
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
              <FaMapMarkedAlt className="mr-1" />
              <span>{user.location || "Unknown"}</span>
            </div>

            {/* Afiseaza genul muzical */}
            {user.genre && (
              <div className="flex items-center text-gray-500 mb-2">
                <FaMicrophone className="mr-1" />
                <span>{user.genre}</span>
              </div>
            )}
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
              onClick={() => handleConnectClick(user)}
            >
              Connect Now
            </button>
          </div>
        ))}
      </div>

      {/* Afiseaza modulul */}
      {selectedUser && (
        <UserProfileDetails user={selectedUser} onClose={handleCloseModal} />
      )}

      {showConnectionModal && connectingUser && (
        <ConnectionModal
          user={connectingUser}
          onClose={handleCloseConnectionModal}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
}

export default Community;
