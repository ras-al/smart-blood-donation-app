// src/services/authService.ts
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    UserCredential
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export type Role = 'donor' | 'hospital' | 'organizer';

export interface RegisterData {
    email: string;
    password: string; 
    username: string;
    role: Role;
    bloodType?: string;
    location?: string;
    organizationName?: string;
    hospitalName?: string;
}

export const registerUser = async (data: RegisterData): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const { user } = userCredential;

    const userProfile = {
        userId: user.uid, // CORRECTED: Changed 'uid' to 'userId'
        username: data.username,
        email: data.email,
        role: data.role,
        ...(data.role === 'donor' && { bloodType: data.bloodType, location: data.location }),
        ...(data.role === 'organizer' && { organizationName: data.organizationName }),
        ...(data.role === 'hospital' && { hospitalName: data.hospitalName }),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);
    return userCredential;
};

export const loginUser = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
    return signOut(auth);
};