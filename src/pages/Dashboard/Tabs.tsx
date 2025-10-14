import React, { useState, useEffect } from "react";
import MyTracks from "./MyTracks";
import MyContacts from "./MyContacts";
import ConnectionRequests from "./ConnectionRequests";
import { FiMusic, FiUsers, FiUserPlus } from "react-icons/fi";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

type TabType = "tracks" | "contacts" | "requests";

const Tabs: React.FC = () => {
  const [active, setActive] = useState<TabType>("tracks");
  const { user } = useAuth();
  const [contactsCount, setContactsCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [hasNewRequests, setHasNewRequests] = useState(false);

  // Fetch contacts count
  useEffect(() => {
    if (!user) return;

    const fetchContactsCount = async () => {
      try {
        const contactsRef = collection(db, "connections");
        const q = query(contactsRef, where("userId", "==", user.id));
        const querySnapshot = await getDocs(q);
        setContactsCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching contacts count:", error);
      }
    };

    fetchContactsCount();
  }, [user]);

  // Fetch requests count and check for new ones
  useEffect(() => {
    if (!user) return;

    const fetchRequestsCount = async () => {
      try {
        const requestsRef = collection(db, "connectionRequests");
        const q = query(
          requestsRef,
          where("receiverId", "==", user.id),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        const count = querySnapshot.size;
        setRequestsCount(count);

        // Check if there are new requests (you can add logic to track seen/unseen)
        setHasNewRequests(count > 0);
      } catch (error) {
        console.error("Error fetching requests count:", error);
      }
    };

    fetchRequestsCount();

    // Refresh every 30 seconds to check for new requests
    const interval = setInterval(fetchRequestsCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const tabClass = (tab: TabType) => `
    flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all relative
    ${active === tab
      ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400"
      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
    }
  `;

  const NotificationDot = () => (
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg">
      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors">
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2">
        <button
          type="button"
          className={tabClass("tracks")}
          onClick={() => setActive("tracks")}
        >
          <FiMusic />
          <span>Tracks</span>
        </button>

        <button
          type="button"
          className={tabClass("contacts")}
          onClick={() => setActive("contacts")}
        >
          <FiUsers />
          <span>Contacte ({contactsCount})</span>
        </button>

        <button
          type="button"
          className={tabClass("requests")}
          onClick={() => {
            setActive("requests");
            setHasNewRequests(false); // Clear notification when clicked
          }}
        >
          <FiUserPlus />
          <span>Cereri ({requestsCount})</span>
          {hasNewRequests && requestsCount > 0 && <NotificationDot />}
        </button>
      </div>

      <div className="p-6">
        {active === "tracks" && <MyTracks />}
        {active === "contacts" && <MyContacts />}
        {active === "requests" && <ConnectionRequests />}
      </div>
    </div>
  );
};

export default Tabs;