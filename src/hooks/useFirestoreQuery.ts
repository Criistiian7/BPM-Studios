import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Hook pentru query-uri Firestore cu real-time updates
 * Simplifică gestionarea datelor din Firestore cu loading states și error handling
 *
 * @template T - Tipul datelor returnate
 * @param collectionName - Numele colecției Firestore
 * @param queryConstraints - Constraint-urile pentru query (opțional)
 * @param enabled - Dacă query-ul este activat (opțional, default: true)
 * @returns Obiect cu data, loading, error și funcții de gestionare
 */
export const useFirestoreQuery = <T = DocumentData>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = [],
  enabled: boolean = true
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(collection(db, collectionName), ...queryConstraints);

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        try {
          const items: T[] = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as T)
          );
          setData(items);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, enabled, ...queryConstraints]);

  const refetch = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);
      const items: T[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as T)
      );
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [collectionName, enabled, ...queryConstraints]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook pentru un singur document din Firestore cu real-time updates
 *
 * @template T - Tipul datelor returnate
 * @param collectionName - Numele colecției Firestore
 * @param documentId - ID-ul documentului
 * @param enabled - Dacă query-ul este activat (opțional, default: true)
 * @returns Obiect cu data, loading, error și funcții de gestionare
 */
export const useFirestoreDocument = <T = DocumentData>(
  collectionName: string,
  documentId: string,
  enabled: boolean = true
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, collectionName, documentId);

    const unsubscribe: Unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        try {
          if (snapshot.exists()) {
            setData({
              id: snapshot.id,
              ...snapshot.data(),
            } as T);
          } else {
            setData(null);
          }
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId, enabled]);

  const refetch = useCallback(async () => {
    if (!enabled || !documentId) return;

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, documentId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        setData({
          id: snapshot.id,
          ...snapshot.data(),
        } as T);
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [collectionName, documentId, enabled]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook pentru query-uri Firestore cu paginare
 *
 * @template T - Tipul datelor returnate
 * @param collectionName - Numele colecției Firestore
 * @param queryConstraints - Constraint-urile pentru query (opțional)
 * @param pageSize - Mărimea paginii (default: 10)
 * @returns Obiect cu data, loading, error și funcții de paginare
 */
export const useFirestorePaginatedQuery = <T = DocumentData>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = [],
  pageSize: number = 10
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);

      const items: T[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as T)
      );

      if (items.length < pageSize) {
        setHasMore(false);
      }

      setData((prev) => [...prev, ...items]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [collectionName, queryConstraints, pageSize, hasMore, loading]);

  const reset = useCallback(() => {
    setData([]);
    setHasMore(true);
    setLastDoc(null);
    setError(null);
  }, []);

  useEffect(() => {
    reset();
    loadMore();
  }, [collectionName, ...queryConstraints]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
};

/**
 * Hook pentru query-uri Firestore cu filtrare și căutare
 *
 * @template T - Tipul datelor returnate
 * @param collectionName - Numele colecției Firestore
 * @param searchTerm - Termenul de căutare
 * @param filters - Filtrele aplicate
 * @returns Obiect cu data, loading, error și funcții de filtrare
 */
export const useFirestoreSearch = <T = DocumentData>(
  collectionName: string,
  searchTerm: string = "",
  filters: Record<string, any> = {}
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(collection(db, collectionName));

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        try {
          let items: T[] = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as T)
          );

          // Aplică filtrele locale
          if (searchTerm) {
            items = items.filter((item) =>
              Object.values(item).some(
                (value) =>
                  typeof value === "string" &&
                  value.toLowerCase().includes(searchTerm.toLowerCase())
              )
            );
          }

          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              items = items.filter((item) => item[key] === value);
            }
          });

          setData(items);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, searchTerm, ...Object.values(filters)]);

  return {
    data,
    loading,
    error,
  };
};
