import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { FiUserPlus, FiCheck, FiX, FiHome } from "react-icons/fi";
import AlertModal from "../../components/AlertModal";
import { useAlert } from "../../hooks/useAlert";

interface ConnectionRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar: string | null;
  senderAccountType: string;
  receiverId: string;
  receiverName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: any;
  // Studio-specific fields
  requestType?: "connection" | "studio_join";
  studioId?: string;
  studioName?: string;
  studioOwnerId?: string;
  studioOwnerName?: string;
}

const ConnectionRequests: React.FC = () => {
  const { user } = useAuth();
  const { alert: alertState, showSuccess, showError, closeAlert } = useAlert();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const requestsRef = collection(db, "connectionRequests");
        const q = query(
          requestsRef,
          where("receiverId", "==", user.id),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        const requestsData: ConnectionRequest[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          requestsData.push({ id: doc.id, ...data } as ConnectionRequest);
        });
        setRequests(requestsData);
      } catch (error: any) {
        console.error("Error fetching requests:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          userId: user.id
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const handleAccept = async (request: ConnectionRequest) => {
    if (!user) return;

    setProcessing(request.id);
    try {
      // Check if connection already exists to prevent duplicates
      const existingConnectionQuery = query(
        collection(db, "connections"),
        where("userId", "==", user.id),
        where("connectedUserId", "==", request.senderId)
      );
      const existingSnapshot = await getDocs(existingConnectionQuery);

      if (!existingSnapshot.empty) {
        // Connection already exists, just update request status and remove from UI
        const requestRef = doc(db, "connectionRequests", request.id);
        await updateDoc(requestRef, {
          status: "accepted",
          acceptedAt: serverTimestamp(),
        });
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
        setProcessing(null);
        return;
      }

      // Update request status
      const requestRef = doc(db, "connectionRequests", request.id);
      await updateDoc(requestRef, {
        status: "accepted",
        acceptedAt: serverTimestamp(),
      });

      // Create connection in both directions
      await addDoc(collection(db, "connections"), {
        userId: user.id,
        connectedUserId: request.senderId,
        connectedUserName: request.senderName,
        connectedUserAvatar: request.senderAvatar,
        connectedUserAccountType: request.senderAccountType,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "connections"), {
        userId: request.senderId,
        connectedUserId: user.id,
        connectedUserName: user.name,
        connectedUserAvatar: user.avatar || null,
        connectedUserAccountType: user.accountType,
        createdAt: serverTimestamp(),
      });

      // Remove from local state
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      showSuccess("Cererea a fost acceptată cu succes!");
    } catch (error) {
      console.error("Error accepting request:", error);
      showError("Eroare la acceptarea cererii. Te rog încearcă din nou.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const requestRef = doc(db, "connectionRequests", requestId);
      await updateDoc(requestRef, {
        status: "rejected",
        rejectedAt: serverTimestamp(),
      });

      // Remove from local state
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      showSuccess("Cererea a fost refuzată.");
    } catch (error) {
      console.error("Error rejecting request:", error);
      showError("Eroare la refuzarea cererii. Te rog încearcă din nou.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Se încarcă cererile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          Te rugăm să te autentifici pentru a vedea cererile
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FiUserPlus />
        Cereri de Conectare & Studio
      </h3>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <FiUserPlus className="mx-auto text-5xl text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nu ai cereri de conectare sau studio
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Când alți utilizatori îți trimit cereri de conectare sau de alăturare la studio, acestea vor apărea aici
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li
              key={request.id}
              className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                {request.senderAvatar ? (
                  <img
                    src={request.senderAvatar}
                    alt={request.senderName}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {request.senderName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {request.senderName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {request.requestType === "studio_join" ? (
                      <div className="flex items-center gap-1">
                        <FiHome className="text-xs" />
                        <span>Vrea să se alăture la </span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {request.studioName}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <FiUserPlus className="text-xs" />
                        <span>
                          {request.senderAccountType === "producer"
                            ? "Producător"
                            : "Artist"}
                        </span>
                      </div>
                    )}
                  </div>
                  {request.requestType === "studio_join" && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Cerere de alăturare la studio
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request)}
                    disabled={processing === request.id}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiCheck />
                    <span>
                      {request.requestType === "studio_join" ? "Acceptă în studio" : "Acceptă"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiX />
                    <span>Refuză</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Alert Modal */}
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

export default ConnectionRequests;
