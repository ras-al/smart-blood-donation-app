// src/hooks/useFirestoreQuery.ts
import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData } from 'firebase/firestore';

// Allow the query to be null
export const useFirestoreQuery = <T>(q: Query<DocumentData> | null): [T[], boolean] => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If the query is null, reset the state and do nothing.
        if (!q) {
            setData([]);
            setLoading(false);
            return;
        }

        // This will only run if 'q' is a valid query object
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as T));
            setData(docs);
            setLoading(false);
        }, (error) => {
            console.error("Firestore query error:", error);
            setLoading(false);
        });

        // Return the cleanup function to detach the listener
        return () => unsubscribe();
    }, [q]); // Dependency array ensures this re-runs when the query changes to null

    return [data, loading];
};