import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { FiUsers, FiMail, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { slugify } from "../../utils/slugify";
import { Avatar } from "../../components/shared";

interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  connectedUserName: string;
  connectedUserAvatar: string | null;
  connectedUserAccountType: string;
  connectedUserEmail?: string;
  connectedUserRating?: number;
  createdAt: any;
}


const MyContacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

        // Fetch full user data for each contact
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
            } as Connection);
          } else {
            contactsData.push({
              id: docSnapshot.id,
              ...connectionData,
              connectedUserRating: 0,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleContactClick(contact)}
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center text-center gap-3">
                {/* Avatar */}
                <Avatar 
                  src={contact.connectedUserAvatar} 
                  name={contact.connectedUserName} 
                  size="lg" 
                  className="border-4 border-gray-100 dark:border-gray-700"
                />

                {/* Name */}
                <div className="flex-1 w-full">
                  <div className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {contact.connectedUserName}
                  </div>

                  {/* Account Type Badge */}
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-2">
                    {contact.connectedUserAccountType === "producer"
                      ? "Producător"
                      : "Artist"}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-3">
                    <FiStar className="fill-current" />
                    <span className="text-sm font-semibold">
                      {(contact.connectedUserRating || 0).toFixed(1)}
                    </span>
                  </div>

                  {/* Send Message Button */}
                  {contact.connectedUserEmail && (
                    <a
                      href={`mailto:${contact.connectedUserEmail}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <FiMail />
                      <span>Trimite mesaj</span>
                    </a>
                  )}
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
