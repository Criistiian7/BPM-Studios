import React, { useState, useEffect } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

// Interfața pentru proprietățile componentei RatingModal
interface RatingModalProps {
    isOpen: boolean;                    // Modal-ul este deschis sau nu
    onClose: () => void;                // Funcția care se apelează când se închide modal-ul
    onSubmitRating: (rating: number) => Promise<void>;  // Funcția care trimite rating-ul
    trackTitle: string;                 // Titlul track-ului care se evaluează
    currentRating?: number;             // Rating-ul actual (opțional)
}

const RatingModal: React.FC<RatingModalProps> = ({
    isOpen,
    onClose,
    onSubmitRating,
    trackTitle,
    currentRating = 0,
}) => {
    // State-uri pentru gestionarea rating-ului
    const [selectedRating, setSelectedRating] = useState<number>(currentRating);
    const [hoverRating, setHoverRating] = useState<number>(0);  // Pentru efectul hover pe stele
    const [submitting, setSubmitting] = useState(false);       // Pentru loading state

    // Actualizează rating-ul selectat când se schimbă currentRating
    useEffect(() => {
        setSelectedRating(currentRating);
    }, [currentRating]);

    // Dacă modal-ul nu este deschis, nu afișa nimic
    if (!isOpen) return null;

    // Funcția care gestionează trimiterea rating-ului
    const handleSubmit = async () => {
        // Verifică dacă utilizatorul a selectat un rating
        if (selectedRating === 0) {
            console.warn('Utilizatorul nu a selectat un rating');
            return;
        }

        setSubmitting(true);
        try {
            // Trimite rating-ul către componenta părinte
            await onSubmitRating(selectedRating);
            // Închide modal-ul după trimiterea cu succes
            onClose();
        } catch (error) {
            console.error('Eroare la trimiterea rating-ului:', error);
            // Eroarea va fi gestionată de componenta părinte prin onSubmitRating
        } finally {
            setSubmitting(false);
        }
    };

    // Funcția care gestionează click-ul pe o stea
    const handleStarClick = (rating: number) => {
        setSelectedRating(rating);
    };

    // Funcția care gestionează hover-ul pe stele
    const handleStarHover = (rating: number) => {
        setHoverRating(rating);
    };

    // Determină ce rating să afișeze (hover sau cel selectat)
    const displayRating = hoverRating || selectedRating;

    return (
        // Overlay-ul modal-ului (fundal întunecat)
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {/* Container-ul principal al modal-ului */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">

                {/* Header-ul modal-ului cu gradient */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 relative">
                    {/* Butonul de închidere */}
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Închide modal-ul"
                    >
                        <FiX className="text-2xl text-white" />
                    </button>

                    {/* Titlul modal-ului */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Evaluează Acest Track
                    </h2>
                    <p className="text-white/90 text-sm">
                        Ce părere ai despre acest track?
                    </p>
                </div>

                {/* Conținutul principal al modal-ului */}
                <div className="p-6 space-y-6">

                    {/* Afișarea titlului track-ului */}
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            Evaluezi:
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            {trackTitle}
                        </h3>
                    </div>

                    {/* Secțiunea pentru rating cu stele */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Container-ul pentru stele */}
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => handleStarHover(star)}
                                    onMouseLeave={() => handleStarHover(0)}
                                    disabled={submitting}
                                    className="transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Evaluează cu ${star} stea${star > 1 ? 'e' : ''}`}
                                >
                                    {star <= displayRating ? (
                                        <FaStar className="text-5xl text-yellow-400 drop-shadow-lg" />
                                    ) : (
                                        <FiStar className="text-5xl text-gray-300 dark:text-gray-600" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Afișarea rating-ului selectat */}
                        <div className="text-center min-h-[2rem]">
                            {displayRating > 0 && (
                                <div className="animate-fade-in">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {displayRating} / 5
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {displayRating === 1 && 'Slab'}
                                        {displayRating === 2 && 'Sub medie'}
                                        {displayRating === 3 && 'Acceptabil'}
                                        {displayRating === 4 && 'Foarte bun'}
                                        {displayRating === 5 && 'Excelent!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Informații despre rating-ul actual */}
                    {currentRating > 0 && selectedRating !== currentRating && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Rating-ul tău actual: <strong>{currentRating} ⭐</strong>
                            </p>
                        </div>
                    )}

                    {/* Butoanele de acțiune */}
                    <div className="flex gap-3">
                        {/* Butonul de anulare */}
                        <button
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anulează
                        </button>

                        {/* Butonul de trimitere */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || selectedRating === 0}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Se trimite...</span>
                                </>
                            ) : (
                                <>
                                    <FaStar className="text-yellow-300" />
                                    <span>Evaluează!</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;

