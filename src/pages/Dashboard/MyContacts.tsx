import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { FiUsers, FiPhone, FiMessageCircle, FiTrash2, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { slugify } from "../../utils/slugify";
import AlertModal from "../../components/AlertModal";
import { useAlert } from "../../hooks/useAlert";
import { getAccountTypeLabel, isProducer } from "../../utils/formatters";

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
  const { alert: alertState, showSuccess, showError, closeAlert } = useAlert();
  const [contacts, setContacts] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState<{ [key: string]: boolean }>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Connection | null>(null);
  const [deleting, setDeleting] = useState(false);


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

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;

    setDeleting(true);
    try {
      // Șterge conexiunea din Firebase
      await deleteDoc(doc(db, "connections", contactToDelete.id));

      // Actualizează lista locală
      setContacts(contacts.filter(c => c.id !== contactToDelete.id));
      
      showSuccess("Contactul a fost șters cu succes!");
    } catch (error) {
      console.error("Error deleting contact:", error);
      showError("Eroare la ștergerea contactului. Te rog încearcă din nou.");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setContactToDelete(null);
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
              className="relative bg-gradient-to-br from-white to-gray-50/30 dark:from-slate-800/90 dark:via-slate-850/85 dark:to-slate-900/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/80 dark:border-slate-700/50 cursor-pointer hover:from-gray-50 hover:to-white dark:hover:from-indigo-900/20 dark:hover:via-slate-800/80 dark:hover:to-purple-900/20 hover:border-indigo-200 dark:hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-2xl dark:hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col h-full shadow-lg shadow-gray-100/50 dark:shadow-black/20 group"
            >
              {/* Buton Delete - Apare doar la hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setContactToDelete(contact);
                  setDeleteModalOpen(true);
                }}
                className="absolute top-4 right-4 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 text-gray-400 dark:text-gray-500 shadow-lg hover:shadow-red-200/50 dark:hover:shadow-red-900/30 hover:scale-110"
                title="Șterge contact"
              >
                <FiTrash2 className="text-lg" />
              </button>

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
                        loading="lazy"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700/50 shadow-md ring-2 ring-gray-50 dark:ring-gray-800"
                        onError={() => setAvatarError(prev => ({ ...prev, [contact.id]: true }))}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/90 to-pink-600/90 dark:from-purple-400/80 dark:to-pink-500/80 flex items-center justify-center text-white text-xl font-semibold border-2 border-gray-100 dark:border-gray-700/50 shadow-md ring-2 ring-gray-50 dark:ring-gray-800">
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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {contact.connectedUserName}
                    </h3>

                    {/* Username */}
                    {contact.connectedUserUsername && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 truncate">
                        @{contact.connectedUserUsername}
                      </p>
                    )}

                    {/* Tip cont și Rating */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                        {isProducer(contact.connectedUserAccountType) ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {getAccountTypeLabel(contact.connectedUserAccountType)}
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                            </svg>
                            {getAccountTypeLabel(contact.connectedUserAccountType)}
                          </>
                        )}
                      </span>

                      {/* Rating */}
                      {contact.connectedUserRating !== undefined && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <FiStar className="fill-current text-sm" />
                          <span className="text-sm font-semibold">{contact.connectedUserRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descriere */}
                <p className="text-gray-600 dark:text-gray-400 text-sm flex-1 line-clamp-3">
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
                  className="flex-1 bg-gray-100 dark:bg-gray-700/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md dark:hover:shadow-indigo-900/20"
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
                  className="flex-1 bg-gray-100 dark:bg-gray-700/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md dark:hover:shadow-indigo-900/20"
                >
                  <FiMessageCircle className="text-sm" />
                  <span className="text-sm">Mesaj</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmare Ștergere */}
      {deleteModalOpen && contactToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <FiTrash2 className="text-2xl text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Șterge Contact
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Această acțiune nu poate fi anulată
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                Ești sigur că vrei să ștergi contactul cu{" "}
                <strong className="text-gray-900 dark:text-white">
                  {contactToDelete.connectedUserName}
                </strong>
                ?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Veți putea reconecta mai târziu trimițând o nouă cerere de conectare.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setContactToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anulează
              </button>
              <button
                onClick={handleDeleteContact}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Se șterge...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    <span>Da, Șterge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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

export default MyContacts;