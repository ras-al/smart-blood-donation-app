import React, { useState } from 'react';
import { Timestamp, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../App';
import { createCampaign } from '../../services/firestoreService';
import { Campaign, CampaignOrganizer } from '../../models';
import LoadingSpinner from '../common/LoadingSpinner';

const OrganizerDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [newCampaignTitle, setNewCampaignTitle] = useState('');
    const [newCampaignLocation, setNewCampaignLocation] = useState('');
    const [newCampaignDate, setNewCampaignDate] = useState('');
    const [newCampaignGoal, setNewCampaignGoal] = useState(50);

    const campaignsQuery = currentUser
        ? query(
            collection(db, 'campaigns'),
            where('organizerId', '==', currentUser.userId)
          )
        : null;

    const [organizerCampaigns, campaignsLoading] = useFirestoreQuery<Campaign>(campaignsQuery!);

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampaignTitle || !newCampaignLocation || !newCampaignDate) {
            alert("Please fill in all fields to create a campaign.");
            return;
        }
        
        const organizerUser = currentUser as CampaignOrganizer;

        // Add all required fields for the service function
        const newCampaignData = {
            title: newCampaignTitle,
            location: newCampaignLocation,
            date: Timestamp.fromDate(new Date(newCampaignDate)),
            goal: newCampaignGoal,
            organizationName: organizerUser.organizationName,
            createdAt: Timestamp.now(), // Add createdAt timestamp
        };

        try {
            await createCampaign(newCampaignData, organizerUser.userId, organizerUser.organizationName);
            setNewCampaignTitle('');
            setNewCampaignLocation('');
            setNewCampaignDate('');
            setNewCampaignGoal(50);
            alert('Campaign created successfully!');
        } catch (error) {
            console.error("Error creating campaign: ", error);
            alert('Failed to create campaign.');
        }
    };
    
    if (campaignsLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3>Create New Campaign</h3>
                <form onSubmit={handleCreateCampaign}>
                    <div className="form-group">
                        <label htmlFor="title">Campaign Title</label>
                        <input type="text" id="title" value={newCampaignTitle} onChange={(e) => setNewCampaignTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input type="text" id="location" value={newCampaignLocation} onChange={(e) => setNewCampaignLocation(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input type="date" id="date" value={newCampaignDate} onChange={(e) => setNewCampaignDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="goal">Unit Goal</label>
                        <input type="number" id="goal" min="10" value={newCampaignGoal} onChange={(e) => setNewCampaignGoal(parseInt(e.target.value, 10))} />
                    </div>
                    <button type="submit">Create Campaign</button>
                </form>
            </div>
            <div className="dashboard-card full-width-card">
                <h3>Your Active Campaigns</h3>
                <ul className="campaign-list">
                    {organizerCampaigns.length > 0 ? (
                        organizerCampaigns.map(campaign => (
                            <li key={campaign.id}>
                               <div className="campaign-info">
                                    <strong>{campaign.title}</strong>
                                    <small>{new Date(campaign.date.toDate()).toLocaleDateString()} at {campaign.location}</small>
                                    <span>{campaign.pledges} / {campaign.goal} units pledged</span>
                               </div>
                            </li>
                        ))
                    ) : (
                        <p>You have not organized any campaigns yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default OrganizerDashboard;