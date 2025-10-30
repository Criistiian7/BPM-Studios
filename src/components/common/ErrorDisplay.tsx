import React from 'react';
import { FiAlertCircle, FiX, FiWifi, FiShield, FiCheckCircle, FiDatabase } from 'react-icons/fi';
import { AppError } from '../../utils/errorHandler';

type ErrorType = 'network' | 'auth' | 'validation' | 'firebase' | 'unknown';

// Interfața pentru proprietățile componentei ErrorDisplay
interface ErrorDisplayProps {
    error: AppError | null;          // Eroarea de afișat
    onClose?: () => void;           // Funcția apelată când se închide eroarea
    className?: string;             // Clase CSS suplimentare
}

/**
 * Componenta ErrorDisplay - afișează erorile într-un mod prietenos utilizatorului
 * 
 * Această componentă este potrivită pentru dezvoltatori juniori deoarece:
 * - Afișează erorile într-un mod clar și înțeles
 * - Folosește iconițe pentru a face erorile mai vizibile
 * - Oferă mesaje prietenoase utilizatorului
 * - Permite închiderea erorii cu un buton
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    onClose,
    className = "",
}) => {
    // Dacă nu există eroare, nu afișa nimic
    if (!error) return null;

    /**
     * Returnează iconița corespunzătoare tipului de eroare
     * @param errorType - Tipul erorii
     * @returns Componenta iconiței
     */
    const getErrorIcon = (errorType: ErrorType) => {
        switch (errorType) {
            case 'network':
                return <FiWifi className="text-red-500" />;
            case 'auth':
                return <FiShield className="text-red-500" />;
            case 'validation':
                return <FiCheckCircle className="text-red-500" />;
            case 'firebase':
                return <FiDatabase className="text-red-500" />;
            default:
                return <FiAlertCircle className="text-red-500" />;
        }
    };

    /**
     * Returnează clasa CSS corespunzătoare tipului de eroare
     * @param errorType - Tipul erorii
     * @returns Clasa CSS pentru background
     */
    const getErrorBackgroundClass = (errorType: ErrorType) => {
        switch (errorType) {
            case 'network':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'auth':
                return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
            case 'validation':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'firebase':
                return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
            default:
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
        }
    };

    /**
     * Returnează mesajul prietenos pentru utilizator
     * @param errorType - Tipul erorii
     * @returns Mesajul prietenos
     */
    const getFriendlyMessage = (errorType: ErrorType): string => {
        switch (errorType) {
            case 'network':
                return 'Nu s-a putut conecta la server. Verifică conexiunea la internet.';
            case 'auth':
                return 'Nu ai permisiunea să faci această acțiune. Te rugăm să te autentifici din nou.';
            case 'validation':
                return 'Datele introduse nu sunt valide. Te rugăm să verifici și să încerci din nou.';
            case 'firebase':
                return 'A apărut o problemă cu baza de date. Te rugăm să încerci din nou.';
            default:
                return 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.';
        }
    };

    // Determine error type from error code
    const getErrorType = (): ErrorType => {
        if (error.code.includes('network') || error.code === 'NETWORK_ERROR') return 'network';
        if (error.code.startsWith('auth/')) return 'auth';
        if (error.code === 'VALIDATION_ERROR' || error.code.includes('validation')) return 'validation';
        if (error.code.includes('permission') || error.code.includes('firebase')) return 'firebase';
        return 'unknown';
    };

    const errorType = getErrorType();

    return (
        <div className={`rounded-lg border p-4 ${getErrorBackgroundClass(errorType)} ${className}`}>
            <div className="flex items-start gap-3">
                {/* Iconița erorii */}
                <div className="flex-shrink-0 mt-0.5">
                    {getErrorIcon(errorType)}
                </div>

                {/* Conținutul erorii */}
                <div className="flex-1 min-w-0">
                    {/* Titlul erorii */}
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                        {errorType === 'network' && 'Problemă de conexiune'}
                        {errorType === 'auth' && 'Problemă de autentificare'}
                        {errorType === 'validation' && 'Date invalide'}
                        {errorType === 'firebase' && 'Problemă cu baza de date'}
                        {errorType === 'unknown' && 'Eroare neașteptată'}
                    </h3>

                    {/* Mesajul erorii */}
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                        {getFriendlyMessage(errorType)}
                    </p>

                    {/* Mesajul tehnic (doar în development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <details className="text-xs text-red-600 dark:text-red-400">
                            <summary className="cursor-pointer hover:text-red-800 dark:hover:text-red-200">
                                Detalii tehnice
                            </summary>
                            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs font-mono">
                                <div><strong>Mesaj:</strong> {error.message}</div>
                                {error.code && <div><strong>Cod:</strong> {error.code}</div>}
                                <div><strong>Timestamp:</strong> {error.timestamp.toLocaleString()}</div>
                            </div>
                        </details>
                    )}
                </div>

                {/* Butonul de închidere */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                        aria-label="Închide eroarea"
                    >
                        <FiX className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * Componenta ErrorBoundary - prinde erorile JavaScript și le afișează
 * 
 * Această componentă este utilă pentru dezvoltatori juniori deoarece:
 * - Prinde erorile JavaScript înainte să crasheze aplicația
 * - Afișează o pagină de eroare prietenoasă
 * - Oferă opțiuni de recovery
 */
export class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary a prins o eroare:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="text-center">
                            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Oops! Ceva nu a mers bine
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                A apărut o eroare neașteptată. Te rugăm să încerci să reîmprospătezi pagina.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Reîmprospătează pagina
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
