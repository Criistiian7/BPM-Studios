import React, { useState, useEffect } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitRating: (rating: number) => Promise<void>;
    trackTitle: string;
    currentRating?: number;
}

const RatingModal: React.FC<RatingModalProps> = ({
    isOpen,
    onClose,
    onSubmitRating,
    trackTitle,
    currentRating = 0,
}) => {
    const [selectedRating, setSelectedRating] = useState<number>(currentRating);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setSelectedRating(currentRating);
    }, [currentRating]);

    if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      // Rating validation - could add visual feedback instead
      return;
    }

        setSubmitting(true);
        try {
            await onSubmitRating(selectedRating);
            onClose();
        } catch (error) {
            console.error('Error submitting rating:', error);
            // Error will be handled by parent component through onSubmitRating
        } finally {
            setSubmitting(false);
        }
    };

    const handleStarClick = (rating: number) => {
        setSelectedRating(rating);
    };

    const handleStarHover = (rating: number) => {
        setHoverRating(rating);
    };

    const displayRating = hoverRating || selectedRating;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 relative">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <FiX className="text-2xl text-white" />
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Rate this Song
                    </h2>
                    <p className="text-white/90 text-sm">
                        Ce părere ai despre acest track?
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Track Title */}
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            Evaluezi:
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            {trackTitle}
                        </h3>
                    </div>

                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => handleStarHover(star)}
                                    onMouseLeave={() => handleStarHover(0)}
                                    disabled={submitting}
                                    className="transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    {star <= displayRating ? (
                                        <FaStar className="text-5xl text-yellow-400 drop-shadow-lg" />
                                    ) : (
                                        <FiStar className="text-5xl text-gray-300 dark:text-gray-600" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Rating Text */}
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

                    {/* Current Rating Info */}
                    {currentRating > 0 && selectedRating !== currentRating && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Rating-ul tău actual: <strong>{currentRating} ⭐</strong>
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anulează
                        </button>
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
                                    <span>Rate this song!</span>
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

