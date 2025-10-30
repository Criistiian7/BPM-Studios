import React, { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../firebase";
import { useAuth } from "../context/authContext";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import type { UserProfile } from "../types/user";
import { FiUserPlus, FiCheck, FiUsers, FiHome, FiMapPin, FiStar, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { slugify } from "../utils/slugify";
import AlertModal from "./AlertModal";
import { useAlert } from "../hooks/useAlert";
import { getAccountTypeLabel, isProducer, isStudio, isArtist } from "../utils/formatters";

function Community() {
  const { user: currentUser } = useAuth();
  const { alert: alertState, showWarning, showError, closeAlert } = useAlert();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [artistsProducersCount, setArtistsProducersCount] = useState(0);
  const [studiosCount, setStudiosCount] = useState(0);
  const navigate = useNavigate();

  // Confirmare "Renunță la studio"
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [studioToLeave, setStudioToLeave] = useState<UserProfile | null>(null);
  const [leaving, setLeaving] = useState(false);

  // Fetch total counts pentru tab toggler - ACTUALIZARE DINAMICĂ
  useEffect(() => {
    // Listener pentru users
    const usersRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const artistsProducers = snapshot.docs.filter(doc => {
        const accountType = doc.data().accountType;
        return isArtist(accountType) || isProducer(accountType);
      });
      setArtistsProducersCount(artistsProducers.length);
    }, (error) => {
      console.error("Error fetching users count:", error);
    });

    // Listener pentru studios
    const studiosRef = collection(db, "studios");
    const unsubscribeStudios = onSnapshot(studiosRef, (snapshot) => {
      setStudiosCount(snapshot.size);
    }, (error) => {
      console.error("Error fetching studios count:", error);
    });

    // Cleanup listeners
    return () => {
      unsubscribeUsers();
      unsubscribeStudios();
    };
  }, []);

  // Actualizare DINAMICĂ a datelor utilizatorilor/studio-urilor
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (typeFilter === "studio") {
      // Listener în timp real pentru studios
      const studiosRef = collection(db, "studios");
      unsubscribe = onSnapshot(studiosRef, (querySnapshot) => {
        const studiosData: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          const studioData = doc.data();
          studiosData.push({
            uid: doc.id, // Studio ID
            displayName: studioData.name || "Studio",
            email: studioData.ownerEmail,
            photoURL: studioData.photoURL || studioData.ownerAvatar,
            accountType: "studio",
            description: studioData.description || "Studio de producție",
            location: studioData.location || "",
            genre: studioData.genre || "",
            rating: studioData.rating || 0,
            socialLinks: studioData.socialLinks || {},
            statistics: studioData.statistics || { tracksUploaded: 0, projectsCompleted: 0 },
            memberSince: studioData.createdAt || "",
            phoneNumber: studioData.phoneNumber || null,
            studioId: doc.id,
            // Studio-specific data
            ownerId: studioData.ownerId,
            ownerName: studioData.ownerName || studioData.name || "Owner",
            ownerEmail: studioData.ownerEmail,
            ownerAvatar: studioData.ownerAvatar,
            slug: studioData.slug,
          });
        });
        setUsers(studiosData);
      }, (error) => {
        console.error("Error fetching studios:", error);
      });
    } else {
      // Listener în timp real pentru regular users
      const usersRef = collection(db, "users");
      const q = typeFilter
        ? query(usersRef, where("accountType", "==", typeFilter))
        : usersRef;

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersData: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        setUsers(usersData);
      }, (error) => {
        console.error("Error fetching users:", error);
      });
    }

    // Cleanup listener când componenta se demontează sau typeFilter se schimbă
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [typeFilter]);

  // Fetch existing requests and connections - CU LISTENER REAL-TIME
  useEffect(() => {
    if (!currentUser) return;


    // Listener real-time pentru cererile trimise
    const requestsRef = collection(db, "connectionRequests");
    const sentQuery = query(
      requestsRef,
      where("senderId", "==", currentUser.id),
      where("status", "==", "pending")
    );

    const unsubscribeSentRequests = onSnapshot(sentQuery, (snapshot) => {
      const sentIds = new Set<string>();
      snapshot.forEach((doc) => {
        sentIds.add(doc.data().receiverId);
      });


      setSentRequests(sentIds);
    }, (error) => {
      console.error("Error in sent requests listener:", error);
    });

    // Listener real-time pentru conexiuni
    const connectionsRef = collection(db, "connections");
    const connectionsQuery = query(
      connectionsRef,
      where("userId", "==", currentUser.id)
    );

    const unsubscribeConnections = onSnapshot(connectionsQuery, (snapshot) => {
      const connectedIds = new Set<string>();
      snapshot.forEach((doc) => {
        connectedIds.add(doc.data().connectedUserId);
      });


      setConnectedUsers(connectedIds);
    }, (error) => {
      console.error("Error in connections listener:", error);
    });

    // Listener real-time pentru cererile de studio acceptate
    const studioRequestsQuery = query(
      requestsRef,
      where("senderId", "==", currentUser.id),
      where("requestType", "==", "studio_join"),
      where("status", "==", "accepted")
    );

    const unsubscribeStudioRequests = onSnapshot(studioRequestsQuery, (snapshot) => {
      const studioConnectedIds = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Pentru studio-uri, conectarea se face cu owner-ul studio-ului
        if (data.studioOwnerId) {
          studioConnectedIds.add(data.studioOwnerId);
        }
      });


      // Actualizează connectedUsers cu conexiunile de studio
      setConnectedUsers(prev => {
        const updated = new Set(prev);
        studioConnectedIds.forEach(id => updated.add(id));
        return updated;
      });
    }, (error) => {
      console.error("Error in studio requests listener:", error);
    });

    // Cleanup listeners
    return () => {
      unsubscribeSentRequests();
      unsubscribeConnections();
      unsubscribeStudioRequests();
    };
  }, [currentUser]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleConnectClick = useCallback(async (targetUser: UserProfile) => {
    if (!currentUser) {
      showWarning("Trebuie să fii autentificat pentru a trimite cereri de conectare.");
      return;
    }

    // For studios, send request to the owner, not the studio itself
    const receiverId = isStudio(targetUser.accountType) && targetUser.ownerId
      ? targetUser.ownerId
      : targetUser.uid;

    const receiverName = isStudio(targetUser.accountType) && targetUser.ownerName
      ? targetUser.ownerName
      : (targetUser.displayName || targetUser.email);

    // Check if already connected
    if (connectedUsers.has(receiverId)) {
      return;
    }

    // Check if request already sent
    if (sentRequests.has(receiverId)) {
      return;
    }

    setSendingRequest(targetUser.uid);

    try {
      const requestType = isStudio(targetUser.accountType) ? "studio_join" : "connection";


      // Check for existing pending requests
      const existingRequestQuery = query(
        collection(db, "connectionRequests"),
        where("senderId", "==", currentUser.id),
        where("receiverId", "==", receiverId),
        where("status", "==", "pending")
      );
      const existingSnapshot = await getDocs(existingRequestQuery);

      if (!existingSnapshot.empty) {
        setSentRequests((prev) => new Set(prev).add(receiverId));
        setSendingRequest(null);
        return;
      }

      // Create request document
      const requestData: {
        senderId: string;
        senderName: string;
        senderEmail: string;
        senderAvatar: string | null;
        senderAccountType: string;
        receiverId: string;
        receiverName: string;
        requestType: string;
        status: string;
        createdAt: ReturnType<typeof serverTimestamp>;
        studioId?: string;
        studioName?: string;
        studioOwnerId?: string;
        studioOwnerName?: string;
      } = {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        senderAvatar: currentUser.avatar || null,
        senderAccountType: currentUser.accountType,
        receiverId: receiverId,
        receiverName: receiverName || "",
        requestType: requestType,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      // Add studio-specific fields if it's a studio join request
      if (isStudio(targetUser.accountType)) {
        requestData.studioId = targetUser.uid;
        requestData.studioName = targetUser.displayName || "";
        requestData.studioOwnerId = targetUser.ownerId;
        requestData.studioOwnerName = targetUser.ownerName || "";
      }

      await addDoc(collection(db, "connectionRequests"), requestData);

      setSentRequests((prev) => new Set(prev).add(receiverId));
    } catch (error: unknown) {
      console.error("Error sending request: ", error);
      const requestTypeText = isStudio(targetUser.accountType) ? "alăturare la studio" : "conectare";
      const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
      showError(`Eroare la trimiterea cererii de ${requestTypeText}: ${errorMessage}`);
    } finally {
      setSendingRequest(null);
    }
  }, [currentUser, sentRequests, connectedUsers, showWarning, showError]);

  // Funcție pentru anularea unei cereri de conectare
  const handleCancelRequest = useCallback(async (targetUser: UserProfile) => {
    if (!currentUser) return;

    try {
      setSendingRequest(targetUser.uid);

      // For studios, cancel request to the owner, not the studio itself
      const receiverId = isStudio(targetUser.accountType) && targetUser.ownerId
        ? targetUser.ownerId
        : targetUser.uid;

      // Găsește și șterge cererea din baza de date
      const requestsRef = collection(db, "connectionRequests");
      const sentQuery = query(
        requestsRef,
        where("senderId", "==", currentUser.id),
        where("receiverId", "==", receiverId),
        where("status", "==", "pending")
      );

      const sentSnapshot = await getDocs(sentQuery);

      if (!sentSnapshot.empty) {
        // Șterge prima cerere găsită (ar trebui să fie doar una)
        await deleteDoc(doc(db, "connectionRequests", sentSnapshot.docs[0].id));

        // Actualizează state-ul local
        setSentRequests((prev) => {
          const newSet = new Set(prev);
          newSet.delete(receiverId);
          return newSet;
        });

        showWarning(`Cererea către ${targetUser.displayName || targetUser.email} a fost anulată.`);
      }
    } catch (error: unknown) {
      console.error("Error canceling request: ", error);
      showError("Eroare la anularea cererii. Te rugăm să încerci din nou.");
    } finally {
      setSendingRequest(null);
    }
  }, [currentUser, showWarning, showError]);

  // Update handleLeaveStudio pentru arrayRemove
  const handleLeaveStudio = useCallback(async (studio: UserProfile) => {
    if (!currentUser || !studio.uid) return;
    try {
      setSendingRequest(studio.uid);
      const studioRef = doc(db, "studios", studio.uid);
      await updateDoc(studioRef, {
        memberIds: arrayRemove(currentUser.id),
        updatedAt: serverTimestamp(),
      });

      // Curăță cererile ACCEPTATE pentru acest studio ca să nu reapari ca "membru"
      try {
        const requestsRef = collection(db, "connectionRequests");
        const acceptedJoinQuery = query(
          requestsRef,
          where("senderId", "==", currentUser.id),
          where("requestType", "==", "studio_join"),
          where("status", "==", "accepted")
        );
        const acceptedSnap = await getDocs(acceptedJoinQuery);
        const toDelete = acceptedSnap.docs.filter(d => {
          const data = d.data() as any;
          return data.studioId === studio.uid || data.receiverId === (studio.ownerId || studio.uid);
        });
        await Promise.all(toDelete.map(d => deleteDoc(doc(db, "connectionRequests", d.id))));
      } catch (err) {
        console.warn("[Community] LeaveStudio: couldn't cleanup accepted requests", err);
      }

      // Actualizează local setul de conexiuni pentru UI instant
      setConnectedUsers(prev => {
        const next = new Set(prev);
        if (studio.ownerId) next.delete(studio.ownerId);
        return next;
      });

      showWarning(`Ai renunțat la studio-ul ${studio.displayName}.`);
    } catch (error) {
      showError("Eroare la renunțarea la studio.");
    } finally {
      setSendingRequest(null);
    }
  }, [currentUser, showWarning, showError]);

  const handleRemoveContactByUser = useCallback(async (targetUser: UserProfile) => {
    if (!currentUser) return;
    try {
      setSendingRequest(targetUser.uid);
      const connectionsRef = collection(db, "connections");
      const q = query(
        connectionsRef,
        where("userId", "==", currentUser.id),
        where("connectedUserId", "==", targetUser.uid)
      );
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, "connections", d.id))));
      showWarning(`Ai șters contactul cu ${targetUser.displayName || targetUser.email}.`);
    } catch (err) {
      console.error("Error removing contact:", err);
      showError("Eroare la ștergerea contactului.");
    } finally {
      setSendingRequest(null);
    }
  }, [currentUser, showWarning, showError]);

  const filteredUsers = useMemo(() => users.filter((user) => {
    // Exclude current user from the list (but NOT studios - studios should always be visible)
    // For studios, we want to show them even if the current user is the owner
    // Only exclude regular users that match current user
    if (currentUser && !isStudio(user.accountType) && user.uid === currentUser.id) {
      return false;
    }

    // Apply search filter - if searchTerm is empty, show all users
    if (!searchTerm.trim()) {
      return true;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.description?.toLowerCase().includes(searchLower) ||
      (isStudio(user.accountType) && user.ownerName?.toLowerCase().includes(searchLower)) ||
      user.location?.toLowerCase().includes(searchLower);

    return matchesSearch;
  }), [users, currentUser, searchTerm]);

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
            placeholder="Caută artiști, producători sau studiouri..."
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
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${typeFilter === ""
                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <FiUsers className="text-lg" />
              <span>Artiști & Producători ({artistsProducersCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter("studio")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${typeFilter === "studio"
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
            // Pentru studiouri, verifică ownerId în loc de uid
            const checkId = isStudio(user.accountType) && user.ownerId ? user.ownerId : user.uid;
            const requestSent = sentRequests.has(checkId);
            const isConnected = connectedUsers.has(checkId);
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
                {isStudio(user.accountType) ? (
                  // Studio Card Layout
                  <>
                    {/* Studio Image */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || "Studio"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                            <FiHome className="text-2xl" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Studio Name */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                      {user.displayName || "Studio"}
                    </h3>

                    {/* Tip cont și Rating */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        Studio
                      </span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <FiStar className="fill-current text-sm" />
                        <span className="text-sm font-semibold">{(user.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Owner Info with Link */}
                    <div className="text-center mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Owner:</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (user.ownerId) {
                            const slug = `${slugify(user.ownerName || 'user')}-${user.ownerId.substring(0, 6)}`;
                            navigate(`/profile/${slug}`);
                          }
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
                      >
                        <span>{user.ownerName || "Unknown Owner"}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-4 line-clamp-2">
                      {user.description || "Fără descriere"}
                    </p>
                  </>
                ) : (
                  // Regular User Card Layout
                  <>
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          loading="lazy"
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${isProducer(user.accountType)
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        }`}>
                        {getAccountTypeLabel(user.accountType)}
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
                  </>
                )}

                {/* Buton Conectare/Alătură-te */}
                {isStudio(user.accountType) ? (
                  // Studio Join Button
                  // Verifică dacă utilizatorul curent este owner-ul studioului
                  currentUser && user.ownerId === currentUser.id ? (
                    <button
                      disabled
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
                      title="Ești owner-ul acestui studio"
                    >
                      <FiUsers />
                      <span>Ești owner-ul studioului</span>
                    </button>
                  ) : isConnected ? (
                    <div className="flex gap-2">
                      <button
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-green-600 dark:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
                      >
                        <FiCheck />
                        <span>Membru</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudioToLeave(user);
                          setLeaveModalOpen(true);
                        }}
                        disabled={isSending}
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        title="Renunță la studio"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : requestSent ? (
                    <div className="flex gap-2">
                      <button
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <FiCheck />
                        <span>Cerere trimisă</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelRequest(user);
                        }}
                        disabled={isSending}
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        title="Anulează cererea"
                      >
                        <FiX />
                      </button>
                    </div>
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
                          <FiUsers />
                          <span>Alătură-te</span>
                        </>
                      )}
                    </button>
                  )
                ) : (
                  // Regular User Connect Button
                  isConnected ? (
                    <div className="flex gap-2">
                      <button
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-green-600 dark:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
                      >
                        <FiCheck />
                        <span>Conectat</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveContactByUser(user);
                        }}
                        disabled={isSending}
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        title="Șterge contact"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : requestSent ? (
                    <div className="flex gap-2">
                      <button
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <FiCheck />
                        <span>Cerere trimisă</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelRequest(user);
                        }}
                        disabled={isSending}
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        title="Anulează cererea"
                      >
                        <FiX />
                      </button>
                    </div>
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
                  )
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

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
      />

      {/* Modal Confirmare Renunță la Studio */}
      {leaveModalOpen && studioToLeave && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <FiX className="text-2xl text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Renunță la Studio</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Această acțiune te va scoate din lista de membri</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                Ești sigur că vrei să renunți la studio-ul
                {" "}
                <strong className="text-gray-900 dark:text-white">{studioToLeave.displayName}</strong>?
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setLeaveModalOpen(false);
                  setStudioToLeave(null);
                }}
                disabled={leaving}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anulează
              </button>
              <button
                onClick={async () => {
                  if (!studioToLeave) return;
                  setLeaving(true);
                  try {
                    await handleLeaveStudio(studioToLeave);
                    setLeaveModalOpen(false);
                    setStudioToLeave(null);
                  } finally {
                    setLeaving(false);
                  }
                }}
                disabled={leaving}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {leaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Se aplică...</span>
                  </>
                ) : (
                  <>
                    <FiX />
                    <span>Da, Renunță</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(Community);
