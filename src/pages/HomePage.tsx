import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page-container">
            <section className="home-hero">
                <div className="hero-content">
                    <h1>Every Drop Counts. Every Donor Matters.</h1>
                    <p>Join our AI-powered network to connect blood donors, hospitals, and organizers, creating a resilient and life-saving community.</p>
                    <button onClick={() => navigate('/login')}>Become a Hero Today</button>
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
};

export default HomePage;