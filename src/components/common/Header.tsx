import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { logoutUser } from '../../services/authService';
import NotificationBell from '../notifications/NotificationBell';

const Header: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
            // After logout, navigate the user back to the homepage
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <header className="main-header">
            <a 
                href="#" 
                className="logo" 
                onClick={(e) => {
                    e.preventDefault();
                    navigate(currentUser ? '/dashboard' : '/');
                }}
            >
                ❤️ DonorLink
            </a>
            <nav className="main-nav">
                {currentUser ? (
                    <>
                        <NotificationBell />
                        <span className="user-greeting">Hi, {currentUser.username}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <button onClick={() => navigate('/login')}>Login / Sign Up</button>
                )}
            </nav>
        </header>
    );
};

export default Header;