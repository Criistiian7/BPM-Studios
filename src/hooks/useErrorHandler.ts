import { useState, useCallback } from 'react';

// Tipurile de erori pe care le poate gestiona hook-ul
export type ErrorType = 'network' | 'auth' | 'validation' | 'firebase' | 'unknown';

// Interfața pentru o eroare gestionată
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  timestamp: Date;
}

// Interfața pentru hook-ul de gestionare a erorilor
interface UseErrorHandlerReturn {
  error: AppError | null;           // Eroarea curentă
  isLoading: boolean;               // Dacă se procesează o operațiune
  setError: (error: AppError) => void;  // Setează o eroare
  clearError: () => void;           // Șterge eroarea curentă
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    errorType?: ErrorType
  ) => Promise<T | null>;           // Gestionează operațiuni async cu erori
  setLoading: (loading: boolean) => void;  // Setează starea de loading
}

/**
 * Hook personalizat pentru gestionarea erorilor în aplicație
 * 
 * Acest hook oferă o modalitate simplă și consistentă de a gestiona erorile
 * în întreaga aplicație, fiind potrivit pentru dezvoltatori juniori.
 * 
 * @returns Obiectul cu funcționalitățile de gestionare a erorilor
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Setează o eroare în starea hook-ului
   * @param error - Obiectul de eroare
   */
  const handleSetError = useCallback((error: AppError) => {
    setError(error);
    console.error(`[${error.type.toUpperCase()}] ${error.message}`, error);
  }, []);

  /**
   * Șterge eroarea curentă
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Setează starea de loading
   * @param loading - Dacă aplicația este în starea de loading
   */
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  /**
   * Gestionează o operațiune async și prinde erorile automat
   * @param operation - Funcția async care trebuie executată
   * @param errorType - Tipul de eroare implicit (opțional)
   * @returns Rezultatul operațiunii sau null în caz de eroare
   */
  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorType: ErrorType = 'unknown'
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      clearError();
      
      const result = await operation();
      return result;
    } catch (err) {
      // Determină tipul și mesajul erorii
      let errorMessage = 'A apărut o eroare neașteptată';
      let finalErrorType = errorType;

      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Determină tipul erorii pe baza mesajului
        if (err.message.includes('network') || err.message.includes('fetch')) {
          finalErrorType = 'network';
        } else if (err.message.includes('auth') || err.message.includes('permission')) {
          finalErrorType = 'auth';
        } else if (err.message.includes('validation') || err.message.includes('invalid')) {
          finalErrorType = 'validation';
        } else if (err.message.includes('firebase') || err.message.includes('firestore')) {
          finalErrorType = 'firebase';
        }
      }

      // Creează obiectul de eroare
      const appError: AppError = {
        type: finalErrorType,
        message: errorMessage,
        code: err instanceof Error ? err.name : undefined,
        timestamp: new Date(),
      };

      handleSetError(appError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleSetError]);

  return {
    error,
    isLoading,
    setError: handleSetError,
    clearError,
    handleAsyncOperation,
    setLoading,
  };
};

/**
 * Funcție helper pentru crearea unui obiect de eroare
 * @param message - Mesajul erorii
 * @param type - Tipul erorii
 * @param code - Codul erorii (opțional)
 * @returns Obiectul de eroare creat
 */
export const createError = (
  message: string,
  type: ErrorType = 'unknown',
  code?: string
): AppError => ({
  type,
  message,
  code,
  timestamp: new Date(),
});

/**
 * Funcție helper pentru mesaje de eroare prietenoase utilizatorului
 * @param errorType - Tipul erorii
 * @returns Mesajul prietenos pentru utilizator
 */
export const getFriendlyErrorMessage = (errorType: ErrorType): string => {
  const messages = {
    network: 'Nu s-a putut conecta la server. Verifică conexiunea la internet.',
    auth: 'Nu ai permisiunea să faci această acțiune. Te rugăm să te autentifici din nou.',
    validation: 'Datele introduse nu sunt valide. Te rugăm să verifici și să încerci din nou.',
    firebase: 'A apărut o problemă cu baza de date. Te rugăm să încerci din nou.',
    unknown: 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.',
  };

  return messages[errorType];
};
