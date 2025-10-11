import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FiUsers, FiMail } from "react-icons/fi";

interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  connectedUserName: string;
  connectedUserAvatar: string | null;
  connectedUserAccountType: string;
  createdAt: any;
}

const MyContacts: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      try {
        const contactsRef = collection(db, "connections");
        const q = query(contactsRef, where("userId", "==", user.id));
        const querySnapshot = await getDocs(q);
        const contactsData: Connection[] = [];
        querySnapshot.forEach((doc) => {
          contactsData.push({ id: doc.id, ...doc.data() } as Connection);
        });
        setContacts(contactsData);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FiUsers />
        Contactele Mele ({contacts.length})
      </h3>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <FiUsers className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Nu ai contacte încă
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Mergi la Comunitate pentru a conecta cu alți utilizatori
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                {contact.connectedUserAvatar ? (
                  <img
                    src={contact.connectedUserAvatar}
                    alt={contact.connectedUserName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {contact.connectedUserName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {contact.connectedUserName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {contact.connectedUserAccountType === "producer"
                      ? "Producător"
                      : "Artist"}
                  </div>
                  <button className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                    <FiMail size={12} />
                    <span>Trimite mesaj</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyContacts;
