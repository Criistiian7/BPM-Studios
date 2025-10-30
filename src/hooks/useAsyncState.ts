import { useState, useCallback } from "react";

/**
 * Hook pentru gestionarea stărilor de loading, error și data pentru operațiuni asincrone
 * Simplifică gestionarea stărilor în componentele care fac operațiuni async
 *
 * @template T - Tipul datelor returnate
 * @param initialValue - Valoarea inițială pentru data
 * @returns Obiect cu data, loading, error și funcția execute
 */
export const useAsyncState = <T>(initialValue: T) => {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execută o operațiune asincronă și gestionează stările de loading și error
   * @param asyncFn - Funcția asincronă de executat
   * @param onSuccess - Callback opțional pentru succes
   * @param onError - Callback opțional pentru eroare
   */
  const execute = useCallback(
    async (
      asyncFn: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: Error) => void
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error.message);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Resetează starea la valorile inițiale
   */
  const reset = useCallback(() => {
    setData(initialValue);
    setLoading(false);
    setError(null);
  }, [initialValue]);

  /**
   * Setează manual data fără a declanșa loading
   * @param newData - Noua valoare pentru data
   */
  const setDataDirectly = useCallback((newData: T) => {
    setData(newData);
  }, []);

  /**
   * Setează manual error-ul
   * @param errorMessage - Mesajul de eroare
   */
  const setErrorDirectly = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData: setDataDirectly,
    setError: setErrorDirectly,
  };
};

/**
 * Hook specializat pentru operațiuni de încărcare inițială
 * Similar cu useAsyncState dar cu loading inițial true
 *
 * @template T - Tipul datelor returnate
 * @param initialValue - Valoarea inițială pentru data
 * @returns Obiect cu data, loading, error și funcția execute
 */
export const useInitialAsyncState = <T>(initialValue: T) => {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      asyncFn: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: Error) => void
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error.message);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(initialValue);
    setLoading(true);
    setError(null);
  }, [initialValue]);

  const setDataDirectly = useCallback((newData: T) => {
    setData(newData);
  }, []);

  const setErrorDirectly = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData: setDataDirectly,
    setError: setErrorDirectly,
  };
};

/**
 * Hook pentru gestionarea stărilor de formular cu validare
 *
 * @template T - Tipul datelor formularului
 * @param initialData - Datele inițiale ale formularului
 * @returns Obiect cu datele formularului, loading, error și funcții de gestionare
 */
export const useFormAsyncState = <T extends Record<string, unknown>>(
  initialData: T
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof T, string>>
  >({});

  const execute = useCallback(
    async <R = unknown>(
      asyncFn: (data: T) => Promise<R>,
      onSuccess?: (result: R) => void,
      onError?: (error: Error) => void
    ) => {
      setLoading(true);
      setError(null);
      setValidationErrors({});

      try {
        const result = await asyncFn(formData);
        onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error.message);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  const updateField = useCallback(
    <V = unknown>(field: keyof T, value: V) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear validation error for this field when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [validationErrors]
  );

  const reset = useCallback(() => {
    setFormData(initialData);
    setLoading(false);
    setError(null);
    setValidationErrors({});
  }, [initialData]);

  const setValidationError = useCallback((field: keyof T, message: string) => {
    setValidationErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const setErrorDirectly = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  return {
    formData,
    loading,
    error,
    validationErrors,
    execute,
    updateField,
    reset,
    setError: setErrorDirectly,
    setValidationError,
  };
};
