import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaCheck, FaTimes } from "react-icons/fa";

interface ConnectionRequestProps {
  id: string;
  senderId: string;
  receiverId: string;
  role: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp;
}

const ConnectionRequests: React.FC = () => {
  const [currentUser, loading, error] = useAuthState(auth);
  const [connectionRequests, setConnectionRequests] = useState<
    ConnectionRequestProps[]
  >([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "connectionRequests"),
      where("receiverId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const requests: ConnectionRequestProps[] = querySnapshot.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ConnectionRequestProps, "id">),
          })
        );
        setConnectionRequests(requests);
      },
      (err) => {
        console.error("Error fetching connection requests:", err);
      }
    );

    return () => unsubscribe(); // cleanup on unmount
  }, [currentUser]);

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const connectionDocRef = doc(db, "connectionRequests", connectionId);
      await updateDoc(connectionDocRef, { status: "accepted" });
    } catch (e) {
      console.error("Something went wrong: ", e);
    }
  };

  const handleRemoveRequest = async (connectionId: string) => {
    try {
      const connectionDocRef = doc(db, "connectionRequests", connectionId);
      await deleteDoc(connectionDocRef);
    } catch (e) {
      console.error("Something went wrong: ", e);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error?.message}</div>;

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Connection Requests
      </h2>
      {connectionRequests.length > 0 ? (
        <ul className="space-y-4">
          {connectionRequests.map((request) => (
            <li
              key={request.id}
              className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-700">
                  {request.senderId}
                </h3>
                <p className="text-gray-500">Role: {request.role}</p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  <FaCheck className="inline mr-1" /> Accept
                </button>
                <button
                  onClick={() => handleRemoveRequest(request.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  <FaTimes className="inline mr-1" /> Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No connection requests at this time.</p>
      )}
    </div>
  );
};

export default ConnectionRequests;
