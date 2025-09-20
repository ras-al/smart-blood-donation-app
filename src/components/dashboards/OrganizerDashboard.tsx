import React, { useState } from 'react';
import { CampaignOrganizer } from '../../models/CampaignOrganizer';
import { CampaignData } from '../../data/mockData';

interface OrganizerDashboardProps {
    user: CampaignOrganizer;
    campaigns: CampaignData[];
    onCreateCampaign: (newCampaign: CampaignData) => void;
}

const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ user, campaigns, onCreateCampaign }) => {
    const [newCampaignTitle, setNewCampaignTitle] = useState('');
    const [newCampaignLocation, setNewCampaignLocation] = useState('');
    const [newCampaignDate, setNewCampaignDate] = useState('');
    const [newCampaignGoal, setNewCampaignGoal] = useState(50);

    const organizerCampaigns = campaigns.filter(c => c.organizer === user.organizationName);

    const handleCreateCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampaignTitle || !newCampaignLocation || !newCampaignDate) {
            alert("Please fill in all fields to create a campaign.");
            return;
        }

        const newCampaign: CampaignData = {
            id: `camp-${Date.now()}`,
            title: newCampaignTitle,
            organizer: user.organizationName,
            location: newCampaignLocation,
            date: newCampaignDate,
            goal: newCampaignGoal,
            pledges: 0,
        };
        
        onCreateCampaign(newCampaign);

        // Reset form
        setNewCampaignTitle('');
        setNewCampaignLocation('');
        setNewCampaignDate('');
        setNewCampaignGoal(50);
    };

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3>Create New Campaign</h3>
                <form onSubmit={handleCreateCampaign}>
                    <div className="form-group">
                        <label htmlFor="title">Campaign Title</label>
                        <input
                            type="text"
                            id="title"
                            value={newCampaignTitle}
                            onChange={(e) => setNewCampaignTitle(e.target.value)}
                            placeholder="e.g., Community Blood Drive"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={newCampaignLocation}
                            onChange={(e) => setNewCampaignLocation(e.target.value)}
                            placeholder="e.g., Town Hall"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            value={newCampaignDate}
                            onChange={(e) => setNewCampaignDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="goal">Unit Goal</label>
                        <input
                            type="number"
                            id="goal"
                            min="10"
                            value={newCampaignGoal}
                            onChange={(e) => setNewCampaignGoal(parseInt(e.target.value, 10))}
                        />
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
                                    <small>{campaign.date} at {campaign.location}</small>
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

