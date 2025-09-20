import React from 'react';
import { useAuth } from '../App';
import HospitalDashboard from '../components/dashboards/HospitalDashboard';
import DonorDashboard from '../components/dashboards/DonorDashboard';
import OrganizerDashboard from '../components/dashboards/OrganizerDashboard';
import { HospitalStaff, Donor, CampaignOrganizer } from '../models';

const DashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    if (!currentUser) return null;

    const renderDashboard = () => {
        switch (currentUser.role) {
            case 'hospital': return <HospitalDashboard />;
            case 'donor': return <DonorDashboard />;
            case 'organizer': return <OrganizerDashboard />;
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

export default DashboardPage;