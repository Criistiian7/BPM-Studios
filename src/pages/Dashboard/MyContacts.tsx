import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { FiUsers, FiPhone, FiMessageCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { slugify } from "../../utils/slugify";

interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  connectedUserName: string;
  connectedUserAvatar: string | null;
  connectedUserAccountType: string;
  connectedUserEmail?: string;
  connectedUserRating?: number;
  connectedUserDescription?: string;
  connectedUserLocation?: string;
  connectedUserUsername?: string; // Added
  connectedUserPhoneNumber?: string; // Added
  createdAt: any;
}


const MyContacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState<{ [key: string]: boolean }>({});


  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      try {
        const contactsRef = collection(db, "connections");
        const q = query(contactsRef, where("userId", "==", user.id));
        const querySnapshot = await getDocs(q);
        const contactsData: Connection[] = [];

        for (const docSnapshot of querySnapshot.docs) {
          const connectionData = docSnapshot.data();
          const userRef = doc(db, "users", connectionData.connectedUserId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            contactsData.push({
              id: docSnapshot.id,
              ...connectionData,
              connectedUserEmail: userData.email,
              connectedUserRating: userData.rating || 0,
              connectedUserDescription: userData.description || "",
              connectedUserLocation: userData.location || "",
              connectedUserUsername: userData.username || userData.displayName?.toLowerCase().replace(/\s+/g, '') || "", // Added
              connectedUserPhoneNumber: userData.phoneNumber || "", // Added
            } as Connection);
          } else {
            contactsData.push({
              id: docSnapshot.id,
              ...connectionData,
              connectedUserRating: 0,
              connectedUserDescription: "",
              connectedUserLocation: "",
              connectedUserUsername: "", // Added
              connectedUserPhoneNumber: "", // Added
            } as Connection);
          }
        }

        setContacts(contactsData);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user]);

  const handleContactClick = async (contact: Connection) => {
    try {
      const userRef = doc(db, "users", contact.connectedUserId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const slug = userData.slug || `${slugify(userData.displayName || contact.connectedUserName)}-${contact.connectedUserId.substring(0, 6)}`;
        navigate(`/profile/${slug}`);
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

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
        Contactele Mele
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleContactClick(contact)}
              className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50/90 dark:hover:bg-gray-750/80 transition-colors flex flex-col h-full shadow-sm dark:shadow-none"
            >
              {/* Conținut Principal */}
              <div className="flex-1 flex flex-col">
                {/* Layout cu Avatar în stânga și detalii în dreapta */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {contact.connectedUserAvatar && !avatarError[contact.id] ? (
                      <img
                        src={contact.connectedUserAvatar}
                        alt={contact.connectedUserName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/20 dark:border-gray-400/30"
                        onError={() => setAvatarError(prev => ({ ...prev, [contact.id]: true }))}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl font-semibold border-2 border-white/20 dark:border-gray-400/30">
                        {contact.connectedUserName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Detalii */}
                  <div className="flex-1 min-w-0">
                    {/* Nume */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {contact.connectedUserName}
                    </h3>

                    {/* Username */}
                    {contact.connectedUserUsername && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 truncate">
                        @{contact.connectedUserUsername}
                      </p>
                    )}

                    {/* Tip cont */}
                    <div className="mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 w-fit">
                        {contact.connectedUserAccountType === "producer" ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Producător
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                            </svg>
                            Artist
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descriere */}
                <p className="text-gray-600 dark:text-gray-300 text-sm flex-1 line-clamp-3">
                  {contact.connectedUserDescription || "Fără descriere"}
                </p>
              </div>

              {/* Butoane Sună și Mesaj - Fixate în partea de jos */}
              <div className="flex gap-3 mt-6">
                {/* Buton Sună */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contact.connectedUserPhoneNumber) {
                      window.open(`tel:${contact.connectedUserPhoneNumber}`, '_self');
                    }
                  }}
                  disabled={!contact.connectedUserPhoneNumber}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-indigo-500 hover:text-white text-gray-700 dark:text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPhone className="text-sm" />
                  <span className="text-sm">Sună</span>
                </button>

                {/* Buton Mesaj */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contact.connectedUserEmail) {
                      window.open(`mailto:${contact.connectedUserEmail}`, '_self');
                    }
                  }}
                  disabled={!contact.connectedUserEmail}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-indigo-500 hover:text-white text-gray-700 dark:text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiMessageCircle className="text-sm" />
                  <span className="text-sm">Mesaj</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyContacts;