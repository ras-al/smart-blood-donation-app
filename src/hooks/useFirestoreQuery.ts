// src/hooks/useFirestoreQuery.ts
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, Query, DocumentData } from 'firebase/firestore';

export const useFirestoreQuery = <T>(q: Query<DocumentData>): [T[], boolean] => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        return () => unsubscribe();
    }, [q]);

    return [data, loading];
};