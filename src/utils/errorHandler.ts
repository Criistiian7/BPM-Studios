import { ERROR_CODES, ERROR_MESSAGES } from "../constants";

/**
 * Clasă personalizată pentru erorile aplicației
 * Permite gestionarea centralizată a erorilor cu context suplimentar
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string = ERROR_CODES.DEFAULT,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }

  /**
   * Returnează un mesaj de eroare prietenos pentru utilizator
   */
  get userMessage(): string {
    return (
      ERROR_MESSAGES[this.code as keyof typeof ERROR_MESSAGES] ||
      ERROR_MESSAGES.DEFAULT
    );
  }

  /**
   * Returnează informații detaliate pentru debugging
   */
  get debugInfo(): Record<string, any> {
    return {
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Funcție pentru gestionarea erorilor Firebase
 * Convertește erorile Firebase în AppError cu mesaje prietenoase
 */
export const handleFirebaseError = (error: any): AppError => {
  const errorCode = error?.code || ERROR_CODES.DEFAULT;
  const errorMessage =
    ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] ||
    ERROR_MESSAGES.DEFAULT;

  return new AppError(errorMessage, errorCode, {
    originalError: error,
    firebaseError: true,
  });
};

/**
 * Funcție pentru gestionarea erorilor de validare
 * Creează erori de validare cu mesaje specifice
 */
export const createValidationError = (
  field: string,
  message: string,
  value?: any
): AppError => {
  return new AppError(message, ERROR_CODES.VALIDATION_ERROR, {
    field,
    value,
    validationError: true,
  });
};

/**
 * Funcție pentru gestionarea erorilor de rețea
 * Detectează și gestionează erorile de conexiune
 */
export const handleNetworkError = (error: any): AppError => {
  const isNetworkError =
    error?.code === "NETWORK_ERROR" ||
    error?.message?.includes("network") ||
    error?.message?.includes("fetch") ||
    !navigator.onLine;

  if (isNetworkError) {
    return new AppError(
      ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      ERROR_CODES.NETWORK_ERROR,
      {
        originalError: error,
        networkError: true,
        online: navigator.onLine,
      }
    );
  }

  return handleFirebaseError(error);
};

/**
 * Hook pentru gestionarea erorilor în componente
 * Simplifică gestionarea erorilor cu logging automat
 */
export const useErrorHandler = () => {
  const logError = (error: AppError | Error, context?: string) => {
    if (error instanceof AppError) {
      console.error(`[${context || "App"}] Error:`, error.debugInfo);
    } else {
      console.error(`[${context || "App"}] Error:`, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
      });
    }
  };

  const handleError = (error: any, context?: string): AppError => {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error?.code && error.code.startsWith("auth/")) {
      appError = handleFirebaseError(error);
    } else if (error?.code && error.code.startsWith("permission-denied")) {
      appError = handleFirebaseError(error);
    } else {
      appError = handleNetworkError(error);
    }

    logError(appError, context);
    return appError;
  };

  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    try {
      return await asyncFn();
    } catch (error) {
      throw handleError(error, context);
    }
  };

  return {
    handleError,
    handleAsyncError,
    logError,
  };
};

/**
 * Funcție pentru validarea datelor de intrare
 * Validează datele și aruncă erori de validare dacă este necesar
 */
export const validateInput = {
  email: (email: string): void => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createValidationError("email", "Email-ul nu este valid");
    }
  },

  password: (password: string): void => {
    if (password.length < 6) {
      throw createValidationError(
        "password",
        "Parola trebuie să aibă cel puțin 6 caractere"
      );
    }
  },

  required: (value: any, fieldName: string): void => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      throw createValidationError(fieldName, `${fieldName} este obligatoriu`);
    }
  },

  minLength: (value: string, minLength: number, fieldName: string): void => {
    if (value.length < minLength) {
      throw createValidationError(
        fieldName,
        `${fieldName} trebuie să aibă cel puțin ${minLength} caractere`
      );
    }
  },

  maxLength: (value: string, maxLength: number, fieldName: string): void => {
    if (value.length > maxLength) {
      throw createValidationError(
        fieldName,
        `${fieldName} trebuie să aibă maximum ${maxLength} caractere`
      );
    }
  },
};

/**
 * Funcție pentru logging centralizat
 * Permite logging consistent în întreaga aplicație
 */
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};

/**
 * Funcție pentru retry logic
 * Implementează retry automat pentru operațiuni care pot eșua
 */
export const withRetry = async <T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Așteaptă înainte de următoarea încercare
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

/**
 * Funcție pentru timeout
 * Adaugă timeout la operațiuni asincrone
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new AppError("Operațiunea a expirat", "timeout")),
        timeoutMs
      )
    ),
  ]);
};
