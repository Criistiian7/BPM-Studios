import React, { createContext, useContext, useState, useCallback } from 'react';

// Interfața pentru starea globală a audio-ului
interface GlobalAudioState {
    currentTrackId: string | null;        // ID-ul track-ului curent redat
    isPlaying: boolean;                   // Dacă audio-ul este în redare
    audioElement: HTMLAudioElement | null; // Referința către elementul audio
}

// Interfața pentru contextul de audio global
interface GlobalAudioContextType {
    currentTrackId: string | null;
    isPlaying: boolean;
    playTrack: (trackId: string, audioElement: HTMLAudioElement) => void;
    pauseTrack: () => void;
    stopTrack: () => void;
    isTrackPlaying: (trackId: string) => boolean;
}

// Creează contextul pentru audio global
const GlobalAudioContext = createContext<GlobalAudioContextType | undefined>(undefined);

/**
 * Provider-ul pentru contextul de audio global
 * 
 * Acest context gestionează redarea audio la nivel global,
 * asigurându-se că doar o piesă poate fi redată la un moment dat.
 * 
 * @param children - Componentele copil
 */
export const GlobalAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<GlobalAudioState>({
        currentTrackId: null,
        isPlaying: false,
        audioElement: null,
    });

    /**
     * Pornește redarea unui track nou
     * @param trackId - ID-ul track-ului de redat
     * @param audioElement - Elementul audio HTML
     */
    const playTrack = useCallback((trackId: string, audioElement: HTMLAudioElement) => {
        // Dacă există deja un track în redare, îl oprește
        if (state.audioElement && state.currentTrackId && state.currentTrackId !== trackId) {
            state.audioElement.pause();
            state.audioElement.currentTime = 0;
        }

        // Setează noul track ca fiind activ
        setState({
            currentTrackId: trackId,
            isPlaying: true,
            audioElement: audioElement,
        });

        // Pornește redarea
        audioElement.play().catch((error) => {
            console.error('Eroare la pornirea audio-ului:', error);
            setState(prev => ({
                ...prev,
                isPlaying: false,
            }));
        });
    }, [state.audioElement, state.currentTrackId]);

    /**
     * Pausează track-ul curent
     */
    const pauseTrack = useCallback(() => {
        if (state.audioElement && state.isPlaying) {
            state.audioElement.pause();
            setState(prev => ({
                ...prev,
                isPlaying: false,
            }));
        }
    }, [state.audioElement, state.isPlaying]);

    /**
     * Oprește complet track-ul curent
     */
    const stopTrack = useCallback(() => {
        if (state.audioElement) {
            state.audioElement.pause();
            state.audioElement.currentTime = 0;
        }

        setState({
            currentTrackId: null,
            isPlaying: false,
            audioElement: null,
        });
    }, [state.audioElement]);

    /**
     * Verifică dacă un track specific este în redare
     * @param trackId - ID-ul track-ului de verificat
     * @returns true dacă track-ul este în redare
     */
    const isTrackPlaying = useCallback((trackId: string) => {
        return state.currentTrackId === trackId && state.isPlaying;
    }, [state.currentTrackId, state.isPlaying]);

    const contextValue: GlobalAudioContextType = {
        currentTrackId: state.currentTrackId,
        isPlaying: state.isPlaying,
        playTrack,
        pauseTrack,
        stopTrack,
        isTrackPlaying,
    };

    return (
        <GlobalAudioContext.Provider value={contextValue}>
            {children}
        </GlobalAudioContext.Provider>
    );
};

/**
 * Hook personalizat pentru utilizarea contextului de audio global
 * 
 * @returns Contextul de audio global
 * @throws Error dacă este folosit în afara GlobalAudioProvider-ului
 */
export const useGlobalAudio = (): GlobalAudioContextType => {
    const context = useContext(GlobalAudioContext);
    if (!context) {
        throw new Error('useGlobalAudio trebuie folosit în interiorul unui GlobalAudioProvider');
    }
    return context;
};

/**
 * Hook pentru gestionarea unui track audio individual
 * 
 * Acest hook oferă funcționalități pentru gestionarea unui track specific,
 * integrându-se cu contextul global de audio.
 * 
 * @param trackId - ID-ul track-ului
 * @param audioElement - Referința către elementul audio
 * @returns Obiectul cu funcționalitățile pentru track-ul specific
 */
export const useTrackAudio = (trackId: string, audioElement: HTMLAudioElement | null) => {
    const globalAudio = useGlobalAudio();

    /**
     * Pornește redarea track-ului curent
     */
    const play = useCallback(() => {
        if (audioElement) {
            globalAudio.playTrack(trackId, audioElement);
        }
    }, [trackId, audioElement, globalAudio]);

    /**
     * Pausează track-ul curent
     */
    const pause = useCallback(() => {
        globalAudio.pauseTrack();
    }, [globalAudio]);

    /**
     * Oprește track-ul curent
     */
    const stop = useCallback(() => {
        globalAudio.stopTrack();
    }, [globalAudio]);

    /**
     * Verifică dacă track-ul curent este în redare
     */
    const isPlaying = globalAudio.isTrackPlaying(trackId);

    /**
     * Verifică dacă track-ul curent este cel activ (chiar dacă este pe pauză)
     */
    const isActive = globalAudio.currentTrackId === trackId;

    return {
        play,
        pause,
        stop,
        isPlaying,
        isActive,
        globalIsPlaying: globalAudio.isPlaying,
    };
};
