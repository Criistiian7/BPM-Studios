import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  Container,
  Card,
  Button,
  Form,
  CardBody,
  CardSubtitle,
  CardTitle,
} from "react-bootstrap";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { type UserProfile } from "../types/user";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

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
    <Container>
      <h2>Profile</h2>
      {profile && (
        <Card>
          <CardBody>
            {!isEditing ? (
              <>
                <CardTitle>{profile.displayName || "N/A"}</CardTitle>
                <CardSubtitle className="mb-2 text-muted">
                  {profile.email || "N/A"}
                </CardSubtitle>
                <Card.Text>
                  {profile.description || "No description yet"}
                </Card.Text>
                {/*Showing of personal information*/}
                <h4>Informații Personale</h4>
                <p>Locatie:{profile.location || "N/A"}</p>
                <p>Telefon:{profile.phoneNumber || "N/A"}</p>
                <p>Membru din:{profile.memberSince || "N/A"}</p>

                {/*Showing of rating and statistics*/}
                <h4>Rating si Statistici</h4>
                <p>Rating: {profile.rating || 0}</p>
                <p>Piese incarcate: {profile.statistics.tracksUploaded || 0}</p>
                <p>
                  Proiecte finalizate:{" "}
                  {profile.statistics.projectsCompleted || 0}
                </p>

                {/* Afișarea link-urilor social media */}
                <h4>Link-uri Social Media</h4>
                <p>
                  <a
                    href={normalizeUrl(profile.socialLinks.facebook || "#")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook />
                    Facebook
                  </a>
                </p>
                <p>
                  <a
                    href={normalizeUrl(profile.socialLinks.instagram || "#")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram />
                    Instagram
                  </a>
                </p>
                <p>
                  <a
                    href={normalizeUrl(profile.socialLinks.youtube || "#")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaYoutube />
                    Youtube
                  </a>
                </p>

                <Button variant="primary" onClick={handleEditClick}>
                  Editează
                </Button>
              </>
            ) : (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nume</Form.Label>
                  <Form.Control
                    type="text"
                    name="displayName"
                    value={tempProfile?.displayName || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descriere</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={tempProfile?.description || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Telefon</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={tempProfile?.phoneNumber || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Locatie</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={tempProfile?.location || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Facebook</Form.Label>
                  <Form.Control
                    type="text"
                    name="socialLinks.facebook"
                    value={tempProfile?.socialLinks?.facebook ?? ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Instagram</Form.Label>
                  <Form.Control
                    type="text"
                    name="socialLinks.instagram"
                    value={tempProfile?.socialLinks?.instagram ?? ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Youtube</Form.Label>
                  <Form.Control
                    type="text"
                    name="socialLinks.youtube"
                    value={tempProfile?.socialLinks?.youtube ?? ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button variant="success" onClick={handleSaveClick}>
                  Salvare
                </Button>
                <Button variant="secondary" onClick={handleCancelClick}>
                  Anulare
                </Button>
              </Form>
            )}
          </CardBody>
        </Card>
      )}
    </Container>
  );
}

export default Profile;
