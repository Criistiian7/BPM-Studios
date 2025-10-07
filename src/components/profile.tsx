import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { UserProfile } from "../types/user";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import ProfileForm from './profileform';

function Profile() {
  const [user, loading, error] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserProfile;
          setProfile(data);
          setTempProfile({ ...data });
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            description: "",
            rating: 0,
            statistics: { tracksUploaded: 0, projectsCompleted: 0 },
            socialLinks: { facebook: null, instagram: null, youtube: null },
            location: "",
            phoneNumber: null,
            memberSince: new Date().toLocaleDateString(),
          };
          setProfile(newProfile);
          setTempProfile({ ...newProfile });
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    if (profile) {
      setTempProfile({ ...profile });
    }
  };

  const handleSaveClick = async () => {
    if (user && tempProfile) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, tempProfile);
        setProfile({ ...tempProfile });
        setIsEditing(false);
      } catch (error: any) {
        console.error("Error updating profile", error);
        alert("Error updating profile:" + error.message);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const keys = name.split("."); // ex: ['socialLinks', 'facebook']
      setTempProfile((prev) => {
        const newProfile = { ...prev };
        let target = newProfile;

        for (let i = 0; i < keys.length - 1; i++) {
          // dacă nu există deja, poți adăuga: target[keys[i]] = target[keys[i]] || {};
          target[keys[i]] = { ...target[keys[i]] }; // clone obiect
          target = target[keys[i]];
        }

        target[keys[keys.length - 1]] = value; // actualizează câmpul final
        return newProfile;
      });
    } else {
      setTempProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const normalizeUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {profile && (
        <div className="bg-white shadow-md rounded p-4">
          {!isEditing ? (
            <>
              <h3 className="text-xl font-semibold mb-2">
                {profile.displayName || "N/A"}
              </h3>
              <h4 className="text-gray-600 mb-2">{profile.email || "N/A"}</h4>
              <p className="text-gray-700">
                {profile.description || "No description yet"}
              </p>

              {/* Afisarea informatiilor personale */}
              <h4 className="text-lg font-semibold mt-4">
                Informații Personale
              </h4>
              <p>Locatie:{profile.location || "N/A"}</p>
              <p>Telefon:{profile.phoneNumber || "N/A"}</p>
              <p>Membru din:{profile.memberSince || "N/A"}</p>

              {/* Afisarea de rating si statistici */}
              <h4 className="text-lg font-semibold mt-4">
                Rating si Statistici
              </h4>
              <p>Rating:{profile.rating || 0}</p>
              <p>Piese incarcate: {profile.statistics.tracksUploaded || 0}</p>

              {/* Afisarea link-urilor social media */}
              <h4 className="text-lg font-semibold mt-4">
                Link-uri Social Media
              </h4>
              <p>
                <a
                  href={profile?.socialLinks?.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaFacebook className="inline mr-1" />
                  Facebook
                </a>
              </p>
              <p>
                <a
                  href={profile?.socialLinks?.instagram || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaInstagram className="inline mr-1" />
                  Instagram
                </a>
              </p>
              <p>
                <a
                  href={profile?.socialLinks?.youtube || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaYoutube className="inline mr-1" />
                  Youtube
                </a>
              </p>

              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={handleEditClick}
              >
                Editează
              </button>
            </>
          ) : (
            <form onSubmit={handleSaveClick}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="displayName"
                >
                  Nume
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={tempProfile?.displayName || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="description"
                >
                  Descriere
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={tempProfile?.description || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="phoneNumber"
                >
                  Telefon
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={tempProfile?.phoneNumber || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Facebook
                </label>
                <input
                  type="text"
                  id="facebook"
                  name="facebook"
                  value={tempProfile?.socialLinks.facebook || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={tempProfile?.socialLinks.instagram || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Youtube
                </label>
                <input
                  type="text"
                  id="youtube"
                  name="youtube"
                  value={tempProfile?.socialLinks.youtube || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-500 hove:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Salvare
                </button>
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleCancelClick}
                >
                  Anulare
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
