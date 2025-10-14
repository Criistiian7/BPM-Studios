import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/authContext";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { UserProfile } from "../types/user";
import { FiUserPlus, FiCheck, FiUsers, FiHome, FiMapPin, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { slugify } from "../utils/slugify";

function Community() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setTypeFilter] = useState("");
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [artistsProducersCount, setArtistsProducersCount] = useState(0);
  const [studiosCount, setStudiosCount] = useState(0);
  const navigate = useNavigate();

  // Fetch total counts pentru tab toggler
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Count artists & producers
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const artistsProducers = usersSnapshot.docs.filter(doc => {
          const accountType = doc.data().accountType;
          return accountType === "artist" || accountType === "producer";
        });
        setArtistsProducersCount(artistsProducers.length);

        // Count studios
        const studiosRef = collection(db, "studios");
        const studiosSnapshot = await getDocs(studiosRef);
        setStudiosCount(studiosSnapshot.size);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (genreFilter === "studio") {
          // Fetch studios from the studios collection
          const studiosRef = collection(db, "studios");
          const querySnapshot = await getDocs(studiosRef);
          const studiosData: any[] = [];
          querySnapshot.forEach((doc) => {
            const studioData = doc.data();
            studiosData.push({
              uid: studioData.ownerId,
              displayName: studioData.ownerName || "Studio",
              email: studioData.ownerEmail,
              photoURL: studioData.ownerAvatar,
              accountType: "studio",
              description: studioData.description || "Studio de producție",
              location: studioData.location || "",
              genre: studioData.genre || "",
              rating: studioData.rating || 0,
              socialLinks: studioData.socialLinks || {},
              statistics: studioData.statistics || { tracksUploaded: 0, projectsCompleted: 0 },
              memberSince: studioData.createdAt || "",
              studioId: doc.id, // ID-ul documentului studio
            });
          });
          setUsers(studiosData);
        } else {
          // Fetch regular users
          const usersRef = collection(db, "users");
          const q = genreFilter
            ? query(usersRef, where("accountType", "==", genreFilter))
            : usersRef;
          const querySnapshot = await getDocs(q);
          const usersData: UserProfile[] = [];
          querySnapshot.forEach((doc) => {
            usersData.push({ uid: doc.id, ...doc.data() } as UserProfile);
          });
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [genreFilter]);

  // Fetch existing requests and connections
  useEffect(() => {
    if (!currentUser) return;

    const fetchRequestsAndConnections = async () => {
      try {
        // Fetch sent requests
        const requestsRef = collection(db, "connectionRequests");
        const sentQuery = query(
          requestsRef,
          where("senderId", "==", currentUser.id),
          where("status", "==", "pending")
        );
        const sentSnapshot = await getDocs(sentQuery);
        const sentIds = new Set<string>();
        sentSnapshot.forEach((doc) => {
          sentIds.add(doc.data().receiverId);
        });
        setSentRequests(sentIds);

        // Fetch connections
        const connectionsRef = collection(db, "connections");
        const connectionsQuery = query(
          connectionsRef,
          where("userId", "==", currentUser.id)
        );
        const connectionsSnapshot = await getDocs(connectionsQuery);
        const connectedIds = new Set<string>();
        connectionsSnapshot.forEach((doc) => {
          connectedIds.add(doc.data().connectedUserId);
        });
        setConnectedUsers(connectedIds);
      } catch (error) {
        console.error("Error fetching requests and connections:", error);
      }
    };

    fetchRequestsAndConnections();
  }, [currentUser]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleConnectClick = async (targetUser: UserProfile) => {
    if (!currentUser) {
      alert("Trebuie să fii autentificat pentru a trimite cereri de conectare.");
      return;
    }

    // Check if already connected
    if (connectedUsers.has(targetUser.uid)) {
      console.log("Already connected to this user");
      return;
    }

    // Check if request already sent
    if (sentRequests.has(targetUser.uid)) {
      console.log("Request already sent to this user");
      return;
    }

    setSendingRequest(targetUser.uid);

    try {
      console.log("Sending connection request:", {
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: targetUser.uid,
        receiverName: targetUser.displayName
      });

      // Check for existing pending requests
      const existingRequestQuery = query(
        collection(db, "connectionRequests"),
        where("senderId", "==", currentUser.id),
        where("receiverId", "==", targetUser.uid),
        where("status", "==", "pending")
      );
      const existingSnapshot = await getDocs(existingRequestQuery);

      if (!existingSnapshot.empty) {
        console.log("Request already exists");
        setSentRequests((prev) => new Set(prev).add(targetUser.uid));
        setSendingRequest(null);
        return;
      }

      await addDoc(collection(db, "connectionRequests"), {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        senderAvatar: currentUser.avatar || null,
        senderAccountType: currentUser.accountType,
        receiverId: targetUser.uid,
        receiverName: targetUser.displayName || targetUser.email,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSentRequests((prev) => new Set(prev).add(targetUser.uid));
      console.log("Connection request sent successfully!");
    } catch (error: any) {
      console.error("Error sending connection request: ", error);
      alert("Eroare la trimiterea cererii: " + error.message);
    } finally {
      setSendingRequest(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Exclude current user from the list
    if (currentUser && user.uid === currentUser.id) {
      return false;
    }

    // Apply search filter
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Comunitatea BeatPlanner
        </h2>

        {/* Search Filter */}
        <div className="mb-6">
          <label htmlFor="search" className="sr-only">
            Caută utilizatori
          </label>
          <input
            id="search"
            type="search"
            placeholder="Caută artiști, producători..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            value={searchTerm}
            onChange={handleSearch}
            aria-label="Caută utilizatori după nume sau descriere"
          />
        </div>

        {/* Tab Toggler pentru tip utilizator cu contori dinamici */}
        <div className="mb-6">
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setTypeFilter("")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${genreFilter === ""
                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <FiUsers className="text-lg" />
              <span>Artiști & Producători ({artistsProducersCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter("studio")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${genreFilter === "studio"
                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <FiHome className="text-lg" />
              <span>Studiouri ({studiosCount})</span>
            </button>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const requestSent = sentRequests.has(user.uid);
            const isConnected = connectedUsers.has(user.uid);
            const isSending = sendingRequest === user.uid;

            return (
              <div
                key={user.uid}
                className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-gray-700"
                onClick={() => {
                  const slug = user.slug || `${slugify(user.displayName || 'user')}-${user.uid.substring(0, 6)}`;
                  navigate(`/profile/${slug}`);
                }}
              >
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold border-2 border-gray-200 dark:border-gray-600">
                      {(user.displayName || "U")
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Nume */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                  {user.displayName || "Utilizator"}
                </h3>

                {/* Tip cont și Rating */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.accountType === "producer"
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    }`}>
                    {user.accountType === "producer" ? "Producător" : "Artist"}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FiStar className="fill-current text-sm" />
                    <span className="text-sm font-semibold">{user.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                </div>

                {/* Descriere */}
                <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-3 line-clamp-2">
                  {user.description || "Fără descriere"}
                </p>

                {/* Locație */}
                {user.location && (
                  <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-4">
                    <FiMapPin className="text-sm" />
                    <span className="text-sm">{user.location}</span>
                  </div>
                )}

                {/* Buton Conectare */}
                {isConnected ? (
                  <button
                    disabled
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-green-600 dark:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
                  >
                    <FiCheck />
                    <span>Conectat</span>
                  </button>
                ) : requestSent ? (
                  <button
                    disabled
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <FiCheck />
                    <span>Cerere trimisă</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectClick(user);
                    }}
                    disabled={isSending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Se trimite...</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus />
                        <span>Conectează-te</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Nu s-au găsit utilizatori
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Community;
