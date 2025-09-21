// src/services/firestoreService.ts
import { 
    db 
} from '../firebaseConfig';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    doc, 
    serverTimestamp, 
    query, 
    where, 
    orderBy,
    getDocs,
    increment,
    setDoc,
    deleteDoc
} from 'firebase/firestore';
import { BloodRequest, Campaign,BloodInventory } from '../models';

// --- Blood Inventory ---
export const updateInventory = async (hospitalId: string, bloodType: string, units: number) => {
    // Use a composite key for the document ID to ensure one record per hospital/blood type
    const docId = `${hospitalId}_${bloodType.replace('+', 'p').replace('-', 'n')}`;
    const inventoryRef = doc(db, 'bloodInventory', docId);

    return await setDoc(inventoryRef, {
        hospitalId,
        bloodType,
        units
    }, { merge: true }); // Use merge to create or update
};

export const getInventoryForHospital = async (hospitalId: string) => {
    const q = query(collection(db, 'bloodInventory'), where('hospitalId', '==', hospitalId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as BloodInventory);
};

// --- Campaigns ---
export const createCampaign = async (campaignData: Omit<Campaign, 'campaignId' | 'pledges' | 'organizerId'>, userId: string, organizationName: string) => {
    return await addDoc(collection(db, 'campaigns'), {
        ...campaignData,
        organizerId: userId,
        organizationName: organizationName,
        pledges: 0,
        createdAt: serverTimestamp()
    });
};

export const pledgeToCampaign = async (campaignId: string) => {
    const campaignRef = doc(db, 'campaigns', campaignId);
    return await updateDoc(campaignRef, {
        pledges: increment(1)
    });
};


// --- Blood Requests ---
export const createBloodRequest = async (requestData: Omit<BloodRequest, 'requestId' | 'postedDate' | 'status' | 'unitsFulfilled' | 'log'>, userId: string, hospitalName: string) => {
    return await addDoc(collection(db, 'bloodRequests'), {
        ...requestData,
        hospitalId: userId,
        hospitalName: hospitalName,
        postedDate: serverTimestamp(),
        status: 'urgent',
        unitsFulfilled: 0,
        log: ['Request posted. Initiating search...']
    });
};

export const updateBloodRequest = async (requestId: string, updates: Partial<BloodRequest>) => {
    const requestRef = doc(db, 'bloodRequests', requestId);
    return await updateDoc(requestRef, updates);
};


// --- Notifications ---
export const createNotification = async (userId: string, message: string) => {
    return await addDoc(collection(db, 'notifications'), {
        userId,
        message,
        read: false,
        createdAt: serverTimestamp()
    });
};

export const getNotifications = async (userId: string) => {
    const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId), 
        orderBy('createdAt', 'desc')
    );
    return await getDocs(q);
};

export const markNotificationAsRead = async (notificationId: string) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    return await updateDoc(notificationRef, { read: true });
};

// --- Deletion Functions ---
export const deleteCampaign = async (campaignId: string) => {
    const campaignRef = doc(db, 'campaigns', campaignId);
    return await deleteDoc(campaignRef);
};

export const deleteBloodRequest = async (requestId: string) => {
    const requestRef = doc(db, 'bloodRequests', requestId);
    return await deleteDoc(requestRef);
};