import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';

// Import Models
import { User } from './models/User';
import { Donor } from './models/Donor';
import { CampaignOrganizer } from './models/CampaignOrganizer';
import { HospitalStaff } from './models/HospitalStaff';

// Import Components
import AuthComponent from './components/AuthComponent';
import HospitalDashboard from './components/dashboards/HospitalDashboard';
import DonorDashboard from './components/dashboards/DonorDashboard';
import CampaignOrganizerDashboard from './components/dashboards/OrganizerDashboard';

// Import Data & Types
import { mockDb, CampaignData } from './data/mockData';

// Import Styles
import './App.css';

// --- TYPE DEFINITIONS ---
type AuthContextType = {
    currentUser: User | null;
    loading: boolean;
};
type Page = 'home' | 'login' | 'dashboard';
type AuthMode = 'login' | 'register';

// --- AUTH CONTEXT ---
const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });
export const useAuth = () => useContext(AuthContext);

// --- APP COMPONENT ---
const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<Page>('home');
    const [campaigns, setCampaigns] = useState<CampaignData[]>(mockDb.campaigns);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data() as { username: string; email: string; role: string; };
                    let userInstance: User;
                    switch (userData.role) {
                        case 'donor':
                            userInstance = new Donor(firebaseUser.uid, userData.username, userData.email, "B-", "Kollam");
                            break;
                        case 'organizer':
                            userInstance = new CampaignOrganizer(firebaseUser.uid, userData.username, userData.email, "Red Cross, Kollam");
                            break;
                        case 'hospital':
                            userInstance = new HospitalStaff(firebaseUser.uid, userData.username, userData.email, "Mercy Hospital, Kollam");
                            break;
                        default:
                            userInstance = new User({ userId: firebaseUser.uid, ...userData });
                    }
                    setCurrentUser(userInstance);
                    setPage('dashboard');
                }
            } else {
                setCurrentUser(null);
                setPage('home');
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    
    const handleCreateCampaign = (newCampaign: CampaignData) => {
        setCampaigns(prev => [newCampaign, ...prev]);
    };

    const handlePledgeToCampaign = (campaignId: string) => {
        setCampaigns(prevCampaigns => 
            prevCampaigns.map(c => 
                c.id === campaignId ? { ...c, pledges: c.pledges + 1 } : c
            )
        );
    };

    const navigate = (newPage: Page) => setPage(newPage);

    return (
        <AuthContext.Provider value={{ currentUser, loading }}>
            <div className="app-shell">
                <Header onNavigate={navigate} onLogout={handleLogout} />
                <main className="content-area">
                    {loading && <div className="loading-overlay"><span>Loading...</span></div>}
                    {!loading && page === 'home' && <HomePage onNavigate={navigate} />}
                    {!loading && page === 'login' && <AuthPage />}
                    {!loading && page === 'dashboard' && 
                        <DashboardPage 
                            campaigns={campaigns} 
                            onCreateCampaign={handleCreateCampaign}
                            onPledge={handlePledgeToCampaign}
                        />
                    }
                </main>
            </div>
        </AuthContext.Provider>
    );
};

// --- LAYOUT & PAGE COMPONENTS ---
const Header: React.FC<{ onNavigate: (page: Page) => void, onLogout: () => void }> = ({ onNavigate, onLogout }) => {
    const { currentUser } = useAuth();
    return (
        <header className="main-header">
            <a href="#" className="logo" onClick={() => onNavigate(currentUser ? 'dashboard' : 'home')}>❤️ VitaLink</a>
            <nav className="main-nav">
                {currentUser ? (
                    <>
                        <span className="user-greeting">Hi, {currentUser.username}</span>
                        <button onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <button onClick={() => onNavigate('login')}>Login / Sign Up</button>
                )}
            </nav>
        </header>
    );
};

const HomePage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
    <div className="home-page-container">
        <section className="home-hero">
            <div className="hero-content">
                <h1>Every Drop Counts. Every Donor Matters.</h1>
                <p>Join our AI-powered network to connect blood donors, hospitals, and organizers, creating a resilient and life-saving community.</p>
                <button onClick={() => onNavigate('login')}>Become a Hero Today</button>
            </div>
        </section>
        <section className="home-features">
            <h2>How VitaLink Works</h2>
            <div className="features-grid">
                <div className="feature-card"><h3>Register</h3><p>Create an account as a Donor, Hospital Staff, or Campaign Organizer in minutes.</p></div>
                <div className="feature-card"><h3>Connect</h3><p>Hospitals post urgent needs, and our AI instantly finds matching donors or partner hospital inventory.</p></div>
                <div className="feature-card"><h3>Save Lives</h3><p>Donors receive alerts, campaigns get organized, and patients receive blood faster than ever.</p></div>
            </div>
        </section>
    </div>
);

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    return (
        <div className="auth-page">
            <div className="auth-form-container">
                <div className="auth-tabs">
                    <button onClick={() => setMode('login')} className={mode === 'login' ? 'active' : ''}>Login</button>
                    <button onClick={() => setMode('register')} className={mode === 'register' ? 'active' : ''}>Register</button>
                </div>
                <AuthComponent mode={mode} />
            </div>
        </div>
    );
};

interface DashboardPageProps {
    campaigns: CampaignData[];
    onCreateCampaign: (campaign: CampaignData) => void;
    onPledge: (campaignId: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ campaigns, onCreateCampaign, onPledge }) => {
    const { currentUser } = useAuth();
    if (!currentUser) return null;

    const renderDashboard = () => {
        switch (currentUser.role) {
            case 'hospital': return <HospitalDashboard user={currentUser as HospitalStaff} />;
            case 'donor': return <DonorDashboard user={currentUser as Donor} campaigns={campaigns} onPledge={onPledge} />;
            case 'organizer': return <CampaignOrganizerDashboard user={currentUser as CampaignOrganizer} campaigns={campaigns} onCreateCampaign={onCreateCampaign} />;
            default: return <p>Dashboard not available.</p>;
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Welcome, {currentUser.username}</h1>
                <p>You are logged in as: <strong>{currentUser.role}</strong></p>
            </div>
            {renderDashboard()}
        </div>
    );
};

export default App;

