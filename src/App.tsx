import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { User, Donor, CampaignOrganizer, HospitalStaff } from './models';

// Components & Pages
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/common/LoadingSpinner';

import './App.css';

type AuthContextType = {
    currentUser: User | null;
    loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });
export const useAuth = () => useContext(AuthContext);

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    let userInstance: User;
                    switch (userData.role) {
                        case 'donor':
                            userInstance = new Donor(firebaseUser.uid, userData.username, userData.email, userData.bloodType, userData.location);
                            break;
                        case 'organizer':
                            userInstance = new CampaignOrganizer(firebaseUser.uid, userData.username, userData.email, userData.organizationName);
                            break;
                        case 'hospital':
                            userInstance = new HospitalStaff(firebaseUser.uid, userData.username, userData.email, userData.hospitalName);
                            break;
                        default:
                            // Corrected constructor call
                            userInstance = new User(firebaseUser.uid, userData.username, userData.email, 'unknown');
                            break;
                    }
                    setCurrentUser(userInstance);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }
    
    return (
        <AuthContext.Provider value={{ currentUser, loading }}>
            <div className="app-shell">
                <Header />
                <main className="content-area">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/dashboard" element={currentUser ? <DashboardPage /> : <HomePage />} />
                    </Routes>
                </main>
            </div>
        </AuthContext.Provider>
    );
};

export default App;