import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { db, storage } from "../firebase";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
    onSnapshot,
    deleteDoc,
    getDoc as getDocFirestore,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Navigate, useNavigate } from "react-router-dom";
import {
    FiMusic,
    FiUsers,
    FiPlus,
    FiEdit2,
    FiUpload,
    FiMapPin,
    FiPhone,
    FiMail,
    FiX,
    FiStar,
    FiTrash2,
    FiCheck,
} from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import AudioPlayer from "../components/AudioPlayer";
import AlertModal from "../components/AlertModal";
import { useAlert } from "../hooks/useAlert";
import type { Studio as StudioType } from "../types/studio";
import type { Track } from "../types/track";
import type { UserProfile } from "../types/user";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAsyncState } from "../hooks/useAsyncState";
import { handleFirebaseError } from "../utils/errorHandler";
import { slugify } from "../utils/slugify";
import { isProducer } from "../utils/formatters";
import { StudioMembers } from "../components/ArtistStudios/StudioMembers";
import { createTrackFirestore, updateTrackFirestore, type UpdateTrackPayload } from "../firebase/api";
import { useTrackNavigation } from "../hooks/useTrackNavigation";

/**
 * Normalizează un URL - adaugă https:// dacă lipsește protocolul
 */
const normalizeUrl = (url: string): string => {
    if (!url) return url;
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
    }
    return `https://${trimmed}`;
};

/**
 * Componenta CreateStudioModal - Modal pentru crearea unui studio nou
 */
interface CreateStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    ownerAvatar: string | null;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
}

const CreateStudioModal: React.FC<CreateStudioModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    ownerId,
    ownerName,
    ownerEmail,
    ownerAvatar,
    showSuccess,
    showError,
}) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        email: "",
        location: "",
        phoneNumber: "",
        facebook: "",
        instagram: "",
        youtube: "",
        photoURL: null as string | null,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showError("Fișierul este prea mare. Maxim 5MB.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            showError("Te rog selectează o imagine validă.");
            return;
        }

        setUploading(true);
        try {
            const storageRef = ref(storage, `studios/${ownerId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setFormData((prev) => ({ ...prev, photoURL: url }));
            showSuccess("Imaginea a fost încărcată cu succes!");
        } catch (error: unknown) {
            console.error("Error uploading image:", error);
            showError(
                `Eroare la încărcarea imaginii: ${error instanceof Error ? error.message : "Eroare necunoscută"}`
            );
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || uploading) return;

        if (!formData.name.trim()) {
            showError("Te rog completează numele studio-ului!");
            return;
        }

        setLoading(true);
        try {
            const studioId = ownerId;
            const baseSlug = slugify(formData.name);
            const slug = `${baseSlug}-${ownerId.substring(0, 6)}`;

            const studioData: Omit<StudioType, "id"> & { slug?: string; ownerEmail?: string } = {
                ownerId,
                ownerName,
                ownerEmail,
                name: formData.name.trim(),
                description: formData.description.trim(),
                photoURL: formData.photoURL || ownerAvatar,
                email: formData.email.trim() || undefined,
                location: formData.location.trim() || undefined,
                phoneNumber: formData.phoneNumber.trim() || undefined,
                socialLinks: {
                    facebook: formData.facebook.trim() ? normalizeUrl(formData.facebook.trim()) : null,
                    instagram: formData.instagram.trim() ? normalizeUrl(formData.instagram.trim()) : null,
                    youtube: formData.youtube.trim() ? normalizeUrl(formData.youtube.trim()) : null,
                },
                memberIds: [],
                trackCount: 0,
                rating: 0,
                createdAt: serverTimestamp() as unknown as string,
                updatedAt: serverTimestamp() as unknown as string,
                slug,
            };

            const studioRef = doc(db, "studios", studioId);
            await setDoc(studioRef, studioData);

            setFormData({
                name: "",
                description: "",
                email: "",
                location: "",
                phoneNumber: "",
                facebook: "",
                instagram: "",
                youtube: "",
                photoURL: null,
            });

            onClose();
            onSuccess();
            showSuccess("Studio creat cu succes. Felicitări!");
        } catch (error: unknown) {
            console.error("Error creating studio:", error);
            showError(
                `Eroare la crearea studio-ului: ${error instanceof Error ? error.message : "Eroare necunoscută"}`
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Creează-ți propriul Studio
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Închide modalul"
                    >
                        <FiX className="text-2xl text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nume Studio <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Ex: My Music Studio"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descriere
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Descrie studioul tău..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Foto Studio
                        </label>
                        <div className="flex items-center space-x-4">
                            {formData.photoURL && (
                                <img
                                    src={formData.photoURL}
                                    alt="Studio preview"
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Studio
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="studio@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="+40 123 456 789"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Locație
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="București, România"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Link-uri Social Media
                        </label>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <FaFacebook className="text-blue-600 w-5 h-5" />
                                <input
                                    type="text"
                                    name="facebook"
                                    value={formData.facebook}
                                    onChange={handleChange}
                                    placeholder="https://facebook.com/..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaInstagram className="text-pink-600 w-5 h-5" />
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="https://instagram.com/..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaYoutube className="text-red-600 w-5 h-5" />
                                <input
                                    type="text"
                                    name="youtube"
                                    value={formData.youtube}
                                    onChange={handleChange}
                                    placeholder="https://youtube.com/..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            disabled={loading || uploading}
                        >
                            Anulează
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || uploading}
                        >
                            {loading ? "Se creează..." : "Creează Studio"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
* Componenta EditStudioModal - Modal pentru editarea studioului
*/
interface EditStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    studio: StudioType;
    ownerAvatar: string | null;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
}

const EditStudioModal: React.FC<EditStudioModalProps> = ({
    isOpen,
    onClose,
    studio,
    ownerAvatar,
    showSuccess,
    showError,
}) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: studio.name || "",
        description: studio.description || "",
        email: studio.email || "",
        location: studio.location || "",
        phoneNumber: studio.phoneNumber || "",
        facebook: studio.socialLinks?.facebook || "",
        instagram: studio.socialLinks?.instagram || "",
        youtube: studio.socialLinks?.youtube || "",
        photoURL: studio.photoURL || null as string | null,
    });

    // Actualizează formData când studio se schimbă
    useEffect(() => {
        if (studio) {
            setFormData({
                name: studio.name || "",
                description: studio.description || "",
                email: studio.email || "",
                location: studio.location || "",
                phoneNumber: studio.phoneNumber || "",
                facebook: studio.socialLinks?.facebook || "",
                instagram: studio.socialLinks?.instagram || "",
                youtube: studio.socialLinks?.youtube || "",
                photoURL: studio.photoURL || null,
            });
        }
    }, [studio]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showError("Fișierul este prea mare. Maxim 5MB.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            showError("Te rog selectează o imagine validă.");
            return;
        }

        setUploading(true);
        try {
            const storageRef = ref(storage, `studios/${studio.ownerId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setFormData((prev) => ({ ...prev, photoURL: url }));
            showSuccess("Imaginea a fost încărcată cu succes!");
        } catch (error: unknown) {
            console.error("Error uploading image:", error);
            showError(
                `Eroare la încărcarea imaginii: ${error instanceof Error ? error.message : "Eroare necunoscută"}`
            );
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || uploading) return;

        if (!formData.name.trim()) {
            showError("Te rog completează numele studio-ului!");
            return;
        }

        setLoading(true);
        try {
            const studioRef = doc(db, "studios", studio.id);
            await updateDoc(studioRef, {
                name: formData.name.trim(),
                description: formData.description.trim(),
                photoURL: formData.photoURL || ownerAvatar,
                email: formData.email.trim() || null,
                location: formData.location.trim() || null,
                phoneNumber: formData.phoneNumber.trim() || null,
                socialLinks: {
                    facebook: formData.facebook.trim() ? normalizeUrl(formData.facebook.trim()) : null,
                    instagram: formData.instagram.trim() ? normalizeUrl(formData.instagram.trim()) : null,
                    youtube: formData.youtube.trim() ? normalizeUrl(formData.youtube.trim()) : null,
                },
                updatedAt: serverTimestamp(),
            });

            showSuccess("Studio-ul a fost actualizat cu succes!");
            onClose();
        } catch (error: unknown) {
            console.error("Error updating studio:", error);
            showError(
                `Eroare la actualizarea studio-ului: ${error instanceof Error ? error.message : "Eroare necunoscută"}`
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Editează Studio
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Închide modalul"
                    >
                        <FiX className="text-2xl text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nume Studio <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Ex: My Music Studio"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descriere
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Descrie studioul tău..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Foto Studio
                        </label>
                        <div className="flex items-center space-x-4">
                            {formData.photoURL && (
                                <img
                                    src={formData.photoURL}
                                    alt="Studio preview"
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Studio
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="studio@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="+40 123 456 789"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Locație
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="București, România"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Link-uri Social Media
                        </label>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <FaFacebook className="text-blue-600 w-5 h-5" />
                                <input
                                    type="text"
                                    name="facebook"
                                    value={formData.facebook}
                                    onChange={handleChange}
                                    placeholder="https://facebook.com/..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaInstagram className="text-pink-600 w-5 h-5" />
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="https://instagram.com/..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaYoutube className="text-red-600 w-5 h-5" />
                                <input
                                    type="text"
                                    name="youtube"
                                    value={formData.youtube}
                                    onChange={handleChange}
                                    placeholder="https://youtube.com/..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            disabled={loading || uploading}
                        >
                            Anulează
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || uploading}
                        >
                            {loading ? "Se salvează..." : "Salvează Modificările"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Componenta StudioHeader - refactorizată să se asemene cu ProfileCard
 */
interface StudioHeaderProps {
    studio: StudioType;
    trackCount: number;
    onEdit: () => void;
    onUpload: () => void;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({
    studio,
    trackCount,
    onEdit,
    onUpload,
}) => {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors mb-8">
            {/* Header Section with Avatar and Basic Info - similar cu ProfileCard */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 relative">
                {/* Butoane de acțiune - doar iconițe cu hover */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 text-white/90 hover:text-white hover:bg-indigo-600 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Editează studio-ul"
                        aria-label="Editează"
                    >
                        <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onUpload}
                        className="p-2 text-white/90 hover:text-white hover:bg-emerald-600 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Încarcă track nou"
                        aria-label="Încarcă Track"
                    >
                        <FiUpload className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    {studio.photoURL ? (
                        <img
                            src={studio.photoURL}
                            alt={studio.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-2xl font-semibold text-indigo-600 shadow-lg">
                            {getInitials(studio.name)}
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {studio.name}
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm text-white px-3 py-1 text-sm font-medium">
                                Studio
                            </span>
                            <span className="inline-flex items-center gap-1 text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                                <FiStar className="fill-current text-yellow-300" />
                                {studio.rating ? studio.rating.toFixed(1) : "0.0"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section - similar cu ProfileCard */}
            <div className="p-6 space-y-4">
                {/* Description */}
                {studio.description && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                            Despre
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            {studio.description}
                        </p>
                    </div>
                )}

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Email */}
                    {studio.email && (
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <FiMail className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <div className="overflow-hidden">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-sm truncate">{studio.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {studio.location && (
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <FiMapPin className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Locație</p>
                                <p className="text-sm">{studio.location}</p>
                            </div>
                        </div>
                    )}

                    {/* Phone */}
                    {studio.phoneNumber && (
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <FiPhone className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
                                <p className="text-sm">{studio.phoneNumber}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Social Media Links */}
                {(studio.socialLinks?.facebook || studio.socialLinks?.instagram || studio.socialLinks?.youtube) && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                            Social Media
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {studio.socialLinks.facebook && (
                                <a
                                    href={studio.socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 text-slate-500 dark:text-slate-400 hover:text-[#1877F2] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                                    title="Facebook"
                                    aria-label="Facebook"
                                >
                                    <FaFacebook className="text-2xl" />
                                </a>
                            )}
                            {studio.socialLinks.instagram && (
                                <a
                                    href={studio.socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 text-slate-500 dark:text-slate-400 hover:text-[#E4405F] hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                                    title="Instagram"
                                    aria-label="Instagram"
                                >
                                    <FaInstagram className="text-2xl" />
                                </a>
                            )}
                            {studio.socialLinks.youtube && (
                                <a
                                    href={studio.socialLinks.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 text-slate-500 dark:text-slate-400 hover:text-[#FF0000] hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                                    title="YouTube"
                                    aria-label="YouTube"
                                >
                                    <FaYoutube className="text-2xl" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Statistics */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                        Statistici
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {trackCount}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Track-uri
                            </div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {studio.memberIds?.length || 0}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Membri
                            </div>
                        </div>
                    </div>
                </div>

                {/* Member Since */}
                {studio.createdAt && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                        Studio creat în {typeof studio.createdAt === 'string'
                            ? new Date(studio.createdAt).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })
                            : 'luna aceasta'}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Componenta StudioTabs - tab-urile pentru tracks și membri
 */
interface StudioTabsProps {
    activeTab: "tracks" | "members";
    onTabChange: (tab: "tracks" | "members") => void;
    tracksCount: number;
    membersCount: number;
}

const StudioTabs: React.FC<StudioTabsProps> = ({
    activeTab,
    onTabChange,
    tracksCount,
    membersCount,
}) => {
    return (
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-6">
            <button
                onClick={() => onTabChange("tracks")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors flex-1 justify-center ${activeTab === "tracks"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
            >
                <FiMusic className="w-4 h-4" />
                <span>Tracks ({tracksCount})</span>
            </button>
            <button
                onClick={() => onTabChange("members")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors flex-1 justify-center ${activeTab === "members"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
            >
                <FiUsers className="w-4 h-4" />
                <span>Membri ({membersCount})</span>
            </button>
        </div>
    );
};

/**
 * Componenta StudioTracksList - lista de tracks - actualizată cu designul din MyTracks
 */
interface StudioTracksListProps {
    tracks: Track[];
    loading: boolean;
    studio: StudioType;
    user: { id: string; name?: string; email?: string };
    onTrackUpdate: () => void;
}

const StudioTracksList: React.FC<StudioTracksListProps> = ({
    tracks,
    loading,
    studio,
    user,
    onTrackUpdate,
}) => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useAlert();
    const { autoPlayTrackId, trackRefs, handleNext, handlePrevious } = useTrackNavigation(tracks);
    const [editingTrack, setEditingTrack] = useState<Track | null>(null);
    const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
    const [contacts, setContacts] = useState<Array<{ id: string; connectedUserId: string; connectedUserName: string; connectedUserAvatar: string | null }>>([]);

    // Fetch contacts pentru colaboratori
    useEffect(() => {
        if (!user?.id) return;

        const fetchContacts = async () => {
            try {
                const contactsRef = collection(db, "connections");
                const q = query(contactsRef, where("userId", "==", user.id));
                const querySnapshot = await getDocs(q);
                const contactsData: Array<{ id: string; connectedUserId: string; connectedUserName: string; connectedUserAvatar: string | null }> = [];

                for (const docSnapshot of querySnapshot.docs) {
                    const connectionData = docSnapshot.data();
                    const userRef = doc(db, "users", connectionData.connectedUserId);
                    const userDoc = await getDocFirestore(userRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        contactsData.push({
                            id: connectionData.connectedUserId,
                            connectedUserId: connectionData.connectedUserId,
                            connectedUserName: userData.name || userData.displayName || userData.email || "Unknown",
                            connectedUserAvatar: userData.photoURL || null,
                        });
                    }
                }

                setContacts(contactsData);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };

        fetchContacts();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 animate-pulse">
                        <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (tracks.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <FiMusic className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nu există tracks
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Acest studio nu are tracks încărcate încă.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {tracks.map((track, index) => (
                    <div
                        key={track.id}
                        ref={(el) => {
                            if (el) trackRefs.current[track.id] = el;
                        }}
                        className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/70 transition-all duration-300 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600"
                    >
                        {track.audioURL && (
                            <AudioPlayer
                                audioURL={track.audioURL}
                                title={track.title}
                                genre={track.genre}
                                status={track.status}
                                uploadedBy={studio.name}
                                uploadedById={studio.id}
                                trackId={track.id}
                                currentUserId={user.id}
                                currentUserName={user.name}
                                studioId={studio.id}
                                collaborators={(track as any).collaborators || []}
                                onUploadedByClick={() => {
                                    const studioSlug = `${slugify(studio.name)}-${studio.id.substring(0, 6)}`;
                                    navigate(`/profile/${studioSlug}`);
                                }}
                                onEdit={() => setEditingTrack(track)}
                                onDelete={() => setDeletingTrack(track)}
                                onNext={(wasPlaying) => handleNext(index, wasPlaying)}
                                onPrevious={(wasPlaying) => handlePrevious(index, wasPlaying)}
                                hasNext={index < tracks.length - 1}
                                hasPrevious={index > 0}
                                autoPlay={autoPlayTrackId === track.id}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Edit Track Modal */}
            {editingTrack && (
                <EditTrackModal
                    track={editingTrack}
                    contacts={contacts}
                    onClose={() => setEditingTrack(null)}
                    onSuccess={() => {
                        setEditingTrack(null);
                        onTrackUpdate();
                    }}
                    showSuccess={showSuccess}
                    showError={showError}
                />
            )}

            {/* Delete Confirm Modal */}
            {deletingTrack && (
                <DeleteConfirmModal
                    track={deletingTrack}
                    onClose={() => setDeletingTrack(null)}
                    onConfirm={async () => {
                        try {
                            await deleteDoc(doc(db, "tracks", deletingTrack.id));
                            setDeletingTrack(null);
                            onTrackUpdate();
                            showSuccess("Track-ul a fost șters cu succes!");
                        } catch (error) {
                            console.error("Error deleting track:", error);
                            showError("Eroare la ștergerea track-ului. Te rog încearcă din nou.");
                        }
                    }}
                />
            )}
        </>
    );
};

/**
 * Componenta EditTrackModal - pentru editarea track-urilor
 */
interface EditTrackModalProps {
    track: Track;
    contacts: Array<{ id: string; connectedUserId: string; connectedUserName: string; connectedUserAvatar: string | null }>;
    onClose: () => void;
    onSuccess: () => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
}

const EditTrackModal: React.FC<EditTrackModalProps> = ({
    track,
    contacts,
    onClose,
    onSuccess,
    showSuccess,
    showError,
}) => {
    const [title, setTitle] = useState(track.title);
    const [description, setDescription] = useState(track.description || "");
    const [genre, setGenre] = useState(track.genre || "");
    const [status, setStatus] = useState<"Work in Progress" | "Pre-Release" | "Release">((track.status as any) || "Work in Progress");
    const [submitting, setSubmitting] = useState(false);
    const [hasCollaborators, setHasCollaborators] = useState((track as any).collaborators && (track as any).collaborators.length > 0);
    const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>((track as any).collaborators || []);
    const [error, setError] = useState<string | null>(null);

    const toggleCollaborator = (contactId: string) => {
        setSelectedCollaborators(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const updatePayload: UpdateTrackPayload = {
                title: title.trim(),
                description: description.trim(),
                genre: genre.trim(),
                status,
                collaborators: hasCollaborators ? selectedCollaborators : [],
            };

            await updateTrackFirestore(track.id, updatePayload);
            showSuccess("Track-ul a fost actualizat cu succes!");
            onSuccess();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Eroare necunoscută";
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Editează Track</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titlu</label>
                        <input
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Numele piesei..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descriere</label>
                        <textarea
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Adaugă o descriere..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gen Muzical</label>
                        <input
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder="Ex: Hip-Hop, Pop, Rock..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                        <select
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                        >
                            <option value="Work in Progress">Work in Progress</option>
                            <option value="Pre-Release">Pre-Release</option>
                            <option value="Release">Release</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={hasCollaborators}
                                onChange={(e) => {
                                    setHasCollaborators(e.target.checked);
                                    if (!e.target.checked) {
                                        setSelectedCollaborators([]);
                                    }
                                }}
                                className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                Există colaboratori?
                            </span>
                        </label>
                    </div>

                    {hasCollaborators && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Selectează Colaboratori
                            </label>
                            <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 scrollbar-custom">
                                {contacts.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        Nu ai contacte conectate încă
                                    </p>
                                ) : (
                                    contacts.map((contact) => (
                                        <label
                                            key={contact.id}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCollaborators.includes(contact.connectedUserId)}
                                                onChange={() => toggleCollaborator(contact.connectedUserId)}
                                                className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <div className="flex items-center gap-3 flex-1">
                                                {contact.connectedUserAvatar ? (
                                                    <img
                                                        src={contact.connectedUserAvatar}
                                                        alt={contact.connectedUserName}
                                                        loading="lazy"
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {contact.connectedUserName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {contact.connectedUserName}
                                                    </p>
                                                </div>
                                                {selectedCollaborators.includes(contact.connectedUserId) && (
                                                    <FiCheck className="text-indigo-600 dark:text-indigo-400" />
                                                )}
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            {selectedCollaborators.length > 0 && (
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                                    {selectedCollaborators.length} colaborator{selectedCollaborators.length > 1 ? 'i' : ''} selectat{selectedCollaborators.length > 1 ? 'i' : ''}
                                </p>
                            )}
                        </div>
                    )}

                    {error && <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</div>}
                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
                        >
                            Anulează
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-600 hover:to-violet-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                        >
                            {submitting ? "Se salvează..." : "Salvează Modificările"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Componenta DeleteConfirmModal - pentru confirmarea ștergerii track-ului
 */
interface DeleteConfirmModalProps {
    track: Track;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ track, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="p-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                        <FiTrash2 className="text-3xl text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center mb-2">
                        Șterge Track
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                        Sunteți sigur că doriți să ștergeți piesa <span className="font-semibold text-slate-800 dark:text-slate-200">"{track.title}"</span>?
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
                        >
                            Anulează
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all font-medium shadow-lg shadow-red-500/30"
                        >
                            Șterge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Componenta UploadTrackModal - pentru încărcarea track-urilor în studio
 */
interface UploadTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    studio: StudioType;
    user: { id: string; name?: string; email?: string };
    contacts: Array<{ id: string; connectedUserId: string; connectedUserName: string; connectedUserAvatar: string | null }>;
    onSuccess: () => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
}

const UploadTrackModal: React.FC<UploadTrackModalProps> = ({
    isOpen,
    onClose,
    studio,
    user,
    contacts,
    onSuccess,
    showSuccess,
    showError,
}) => {
    const UPLOAD_STORAGE_KEY = "bpm_upload_track_form_data_studio";

    const getInitialFormData = () => {
        try {
            const savedData = localStorage.getItem(UPLOAD_STORAGE_KEY);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (err) {
            console.error("Error loading saved upload form data:", err);
        }
        return {
            title: "",
            description: "",
            genre: "",
            status: "Work in Progress" as "Work in Progress" | "Pre-Release" | "Release",
        };
    };

    const initialData = getInitialFormData();
    const [title, setTitle] = useState(initialData.title);
    const [description, setDescription] = useState(initialData.description);
    const [genre, setGenre] = useState(initialData.genre);
    const [status, setStatus] = useState<"Work in Progress" | "Pre-Release" | "Release">(initialData.status);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasCollaborators, setHasCollaborators] = useState(false);
    const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);

    useEffect(() => {
        const formData = { title, description, genre, status };
        localStorage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(formData));
    }, [title, description, genre, status]);

    const toggleCollaborator = (contactId: string) => {
        setSelectedCollaborators(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAudioFile(e.target.files?.[0] ?? null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !audioFile) {
            showError("Te rog selectează un fișier audio.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const storageRef = ref(
                storage,
                `tracks/${studio.id}/${Date.now()}_${audioFile.name}`
            );
            const snap = await uploadBytes(storageRef, audioFile);
            const url = await getDownloadURL(snap.ref);

            const collaboratorsToSave = hasCollaborators ? selectedCollaborators : [];

            await createTrackFirestore({
                title,
                description,
                status,
                genre,
                ownerId: studio.ownerId,
                ownerName: user.name || user.email || "Unknown",
                audioURL: url,
                collaborators: collaboratorsToSave,
                uploadedByStudio: true,
                studioName: studio.name,
                studioId: studio.id,
            });

            // Șterge datele salvate din localStorage după upload reușit
            localStorage.removeItem(UPLOAD_STORAGE_KEY);

            // Reset form
            setTitle("");
            setDescription("");
            setGenre("");
            setStatus("Work in Progress");
            setAudioFile(null);
            setHasCollaborators(false);
            setSelectedCollaborators([]);

            showSuccess("Track-ul a fost încărcat cu succes!");
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Eroare necunoscută";
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Upload Track Nou</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                        <FiX className="text-2xl" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titlu</label>
                        <input
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Numele piesei..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descriere</label>
                        <textarea
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Adaugă o descriere..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gen Muzical</label>
                        <input
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder="Ex: Hip-Hop, Pop, Rock..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                        <select
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                        >
                            <option value="Work in Progress">Work in Progress</option>
                            <option value="Pre-Release">Pre-Release</option>
                            <option value="Release">Release</option>
                        </select>
                    </div>

                    {/* Colaboratori Checkbox */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={hasCollaborators}
                                onChange={(e) => {
                                    setHasCollaborators(e.target.checked);
                                    if (!e.target.checked) {
                                        setSelectedCollaborators([]);
                                    }
                                }}
                                className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                Există colaboratori?
                            </span>
                        </label>
                    </div>

                    {/* Colaboratori Dropdown */}
                    {hasCollaborators && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Selectează Colaboratori
                            </label>
                            <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 scrollbar-custom">
                                {contacts.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        Nu ai contacte conectate încă
                                    </p>
                                ) : (
                                    contacts.map((contact) => (
                                        <label
                                            key={contact.id}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCollaborators.includes(contact.connectedUserId)}
                                                onChange={() => toggleCollaborator(contact.connectedUserId)}
                                                className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <div className="flex items-center gap-3 flex-1">
                                                {contact.connectedUserAvatar ? (
                                                    <img
                                                        src={contact.connectedUserAvatar}
                                                        alt={contact.connectedUserName}
                                                        loading="lazy"
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {contact.connectedUserName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {contact.connectedUserName}
                                                    </p>
                                                </div>
                                                {selectedCollaborators.includes(contact.connectedUserId) && (
                                                    <FiCheck className="text-indigo-600 dark:text-indigo-400" />
                                                )}
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            {selectedCollaborators.length > 0 && (
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                                    {selectedCollaborators.length} colaborator{selectedCollaborators.length > 1 ? 'i' : ''} selectat{selectedCollaborators.length > 1 ? 'i' : ''}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fișier Audio</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="audio/mpeg,audio/mp3,audio/*"
                                onChange={handleFile}
                                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 dark:hover:file:bg-blue-900/50 file:cursor-pointer cursor-pointer"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                            <span>📁</span> MP3, WAV (max 50MB)
                        </p>
                    </div>
                    {error && (
                        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}
                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
                        >
                            Anulează
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-600 hover:to-violet-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                        >
                            {submitting ? "Se încarcă..." : "Upload Track"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Pagina Studio - Reconstruită complet
 */
const Studio: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { alert, closeAlert, showSuccess, showError } = useAlert();

    const [studio, setStudio] = useState<StudioType | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [activeTab, setActiveTab] = useState<"tracks" | "members">("tracks");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [waitingForAccountType, setWaitingForAccountType] = useState(false);
    const [contacts, setContacts] = useState<Array<{ id: string; connectedUserId: string; connectedUserName: string; connectedUserAvatar: string | null }>>([]);

    const { loading: tracksLoading, execute: loadTracks } = useAsyncState<Track[]>([]);
    const { loading: membersLoading, execute: loadMembers } = useAsyncState<UserProfile[]>([]);

    /**
     * Încarcă track-urile studioului
     */
    const loadTracksData = async (): Promise<Track[]> => {
        if (!studio?.id) return [];

        try {
            const tracksRef = collection(db, "tracks");
            const tracksQuery = query(tracksRef, where("studioId", "==", studio.id));
            const tracksSnapshot = await getDocs(tracksQuery);

            return tracksSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Track[];
        } catch (error) {
            throw handleFirebaseError(error);
        }
    };

    /**
     * Încarcă membrii studioului
     */
    const loadMembersData = async (): Promise<UserProfile[]> => {
        if (!studio?.id || !studio.memberIds || studio.memberIds.length === 0) {
            return [];
        }

        try {
            const memberPromises = studio.memberIds.map(async (memberId) => {
                try {
                    const userRef = doc(db, "users", memberId);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        return {
                            uid: userSnap.id,
                            displayName: userData.displayName || userData.name || "User",
                            email: userData.email,
                            photoURL: userData.photoURL,
                            accountType: userData.accountType || "artist",
                            description: userData.description || "",
                            rating: userData.rating || 0,
                            genre: userData.genre || "",
                            location: userData.location || "",
                            phoneNumber: userData.phoneNumber || null,
                            socialLinks: userData.socialLinks || {
                                facebook: null,
                                instagram: null,
                                youtube: null,
                            },
                            statistics: userData.statistics || {
                                tracksUploaded: 0,
                                projectsCompleted: 0,
                            },
                            memberSince: userData.createdAt || "",
                        } as UserProfile;
                    }
                } catch (error) {
                    console.error(`Error loading member ${memberId}:`, error);
                    return null;
                }
                return null;
            });

            const membersResults = await Promise.all(memberPromises);
            return membersResults.filter((member): member is UserProfile => member !== null);
        } catch (error) {
            throw handleFirebaseError(error);
        }
    };

    // Fetch contacts pentru upload track
    useEffect(() => {
        if (!user?.id) return;

        const fetchContacts = async () => {
            try {
                const contactsRef = collection(db, "connections");
                const q = query(contactsRef, where("userId", "==", user.id));
                const querySnapshot = await getDocs(q);
                const contactsData: Array<{ id: string; connectedUserId: string; connectedUserName: string; connectedUserAvatar: string | null }> = [];

                for (const docSnapshot of querySnapshot.docs) {
                    const connectionData = docSnapshot.data();
                    const userRef = doc(db, "users", connectionData.connectedUserId);
                    const userDoc = await getDocFirestore(userRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        contactsData.push({
                            id: connectionData.connectedUserId,
                            connectedUserId: connectionData.connectedUserId,
                            connectedUserName: userData.name || userData.displayName || userData.email || "Unknown",
                            connectedUserAvatar: userData.photoURL || null,
                        });
                    }
                }

                setContacts(contactsData);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };

        fetchContacts();
    }, [user?.id]);

    // Așteaptă pentru ca datele complete ale user-ului să se încarce din Firestore
    const hasCompleteData = user && (
        user.description !== undefined ||
        user.slug !== undefined ||
        user.location !== undefined ||
        user.phoneNumber !== undefined ||
        (user.accountType !== "artist" && user.accountType !== undefined)
    );

    useEffect(() => {
        if (user && user.accountType === "artist" && !hasCompleteData && !waitingForAccountType) {
            setWaitingForAccountType(true);
            const timer = setTimeout(() => {
                setWaitingForAccountType(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
        if (user && (user.accountType !== "artist" || hasCompleteData)) {
            setWaitingForAccountType(false);
        }
    }, [user?.accountType, hasCompleteData, waitingForAccountType]);

    // Sincronizare în timp real pentru studio - folosind onSnapshot pentru actualizări automate
    useEffect(() => {
        if (!user?.id || !isProducer(user.accountType)) {
            setStudio(null);
            return;
        }

        const studioRef = doc(db, "studios", user.id);

        const unsubscribe = onSnapshot(
            studioRef,
            (studioSnap) => {
                if (studioSnap.exists()) {
                    const studioData = { id: studioSnap.id, ...studioSnap.data() } as StudioType;
                    setStudio(studioData);
                } else {
                    setStudio(null);
                }
            },
            (error) => {
                console.error("Error in studio snapshot:", error);
                setStudio(null);
            }
        );

        return () => unsubscribe();
    }, [user?.id, user?.accountType]);

    // Încarcă tracks când studio-ul există
    useEffect(() => {
        if (studio?.id && activeTab === "tracks") {
            loadTracks(loadTracksData, (result) => {
                setTracks(result);
            });
        }
    }, [studio?.id, activeTab]);

    // Încarcă membrii când studio-ul există și tab-ul este membri
    useEffect(() => {
        if (studio?.id && activeTab === "members") {
            loadMembers(loadMembersData, (result) => {
                setMembers(result);
            });
        }
    }, [studio?.id, activeTab]);

    // Verifică accesul - așteaptă până când autentificarea este completă
    if (authLoading || !user) {
        return <LoadingSpinner fullScreen />;
    }

    const isDefaultAccountType = user.accountType === "artist";
    const shouldWaitForData = isDefaultAccountType && !hasCompleteData;

    if (shouldWaitForData && waitingForAccountType) {
        return <LoadingSpinner fullScreen />;
    }

    if (!isProducer(user.accountType)) {
        if (shouldWaitForData) {
            return <LoadingSpinner fullScreen />;
        }
        return <Navigate to="/profile" replace />;
    }

    // Dacă nu există studio, afișează butonul de creare
    if (!studio) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="mb-8">
                        <div className="mx-auto w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                            <FiPlus className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Creează-ți propriul Studio
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Creează un studio pentru a colabora cu artiști și a produce muzică împreună.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-lg font-semibold flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <FiPlus className="w-6 h-6" />
                        <span>Creează-ți propriul Studio</span>
                    </button>
                </div>

                {/* Create Studio Modal */}
                {user && (
                    <CreateStudioModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            // Studio-ul va fi actualizat automat prin onSnapshot listener
                        }}
                        ownerId={user.id}
                        ownerName={user.name}
                        ownerEmail={user.email}
                        ownerAvatar={user.avatar || null}
                        showSuccess={showSuccess}
                        showError={showError}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <StudioHeader
                    studio={studio}
                    trackCount={tracks.length}
                    onEdit={() => setShowEditModal(true)}
                    onUpload={() => setShowUploadModal(true)}
                />

                {/* Tabs */}
                <StudioTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tracksCount={tracks.length}
                    membersCount={members.length}
                />

                {/* Content */}
                {activeTab === "tracks" ? (
                    <StudioTracksList
                        tracks={tracks}
                        loading={tracksLoading}
                        studio={studio}
                        user={user}
                        onTrackUpdate={() => {
                            loadTracks(loadTracksData, (result) => {
                                setTracks(result);
                            });
                        }}
                    />
                ) : (
                    <StudioMembers members={members} loading={membersLoading} />
                )}

                {/* Edit Studio Modal */}
                {studio && (
                    <EditStudioModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        studio={studio}
                        ownerAvatar={user.avatar || null}
                        showSuccess={showSuccess}
                        showError={showError}
                    />
                )}

                {/* Upload Track Modal */}
                {studio && user && (
                    <UploadTrackModal
                        isOpen={showUploadModal}
                        onClose={() => setShowUploadModal(false)}
                        studio={studio}
                        user={user}
                        contacts={contacts}
                        onSuccess={() => {
                            loadTracks(loadTracksData, (result) => {
                                setTracks(result);
                            });
                        }}
                        showSuccess={showSuccess}
                        showError={showError}
                    />
                )}

                {/* Alert Modal - cu auto-close pentru succes după 2 secunde */}
                {alert.isOpen && (
                    <AlertModal
                        isOpen={alert.isOpen}
                        onClose={closeAlert}
                        title={alert.title}
                        message={alert.message}
                        type={alert.type}
                        autoClose={alert.type === "success"}
                        autoCloseDelay={2000}
                    />
                )}
            </div>
        </div>
    );
};

export default Studio;
