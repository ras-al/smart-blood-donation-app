import React, { useState } from 'react';
import { Timestamp, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../App';
import { createCampaign, deleteCampaign } from '../../services/firestoreService';
import { Campaign, CampaignOrganizer } from '../../models';
import LoadingSpinner from '../common/LoadingSpinner';

const OrganizerDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [newCampaignName, setNewCampaignName] = useState(''); // Changed from newCampaignTitle
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
        if (!newCampaignName || !newCampaignLocation || !newCampaignDate) {
            alert("Please fill in all fields to create a campaign.");
            return;
        }
        
        const organizerUser = currentUser as CampaignOrganizer;

        const newCampaignData = {
            name: newCampaignName, // Changed from title
            location: newCampaignLocation,
            date: Timestamp.fromDate(new Date(newCampaignDate)),
            goalUnits: newCampaignGoal, // Changed from goal
            organizationName: organizerUser.organizationName,
            createdAt: Timestamp.now(),
        };

        try {
            await createCampaign(newCampaignData, organizerUser.userId, organizerUser.organizationName);
            setNewCampaignName('');
            setNewCampaignLocation('');
            setNewCampaignDate('');
            setNewCampaignGoal(50);
            alert('Campaign created successfully!');
        } catch (error) {
            console.error("Error creating campaign: ", error);
            alert('Failed to create campaign.');
        }
    };

    const handleDeleteCampaign = async (campaignId: string) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            try {
                await deleteCampaign(campaignId);
                alert('Campaign deleted successfully.');
            } catch (error) {
                console.error("Error deleting campaign: ", error);
                alert('Failed to delete campaign.');
            }
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
                        <label htmlFor="name">Campaign Name</label> {/* Changed from title */}
                        <input type="text" id="name" value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} />
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
                                    <strong>{campaign.name}</strong> {/* Changed from title */}
                                    <small>{new Date(campaign.date.toDate()).toLocaleDateString()} at {campaign.location}</small>
                                    <span>{campaign.pledges} / {campaign.goalUnits} units pledged</span> {/* Changed from goal */}
                               </div>
                               <button className="secondary" onClick={() => handleDeleteCampaign(campaign.id!)}>Delete</button>
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