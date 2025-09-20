import React from 'react';
import { Donor } from '../../models/Donor';
import { mockDb, CampaignData } from '../../data/mockData';

interface DonorDashboardProps {
    user: Donor;
    campaigns: CampaignData[];
    onPledge: (campaignId: string) => void;
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ user, campaigns, onPledge }) => {
    const donationHistory = mockDb.donationHistory.filter(d => d.donorId === user.userId);
    const totalUnitsDonated = donationHistory.reduce((acc, curr) => acc + curr.unitsDonated, 0);

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3>Track Your Impact</h3>
                <div className="impact-score">
                    <h2>{totalUnitsDonated}</h2>
                    <p>Total Units Donated</p>
                </div>
                <p>Each donation can save up to 3 lives. Thank you for your contributions!</p>
            </div>
            <div className="dashboard-card">
                <h3>Donation History</h3>
                <ul>
                    {donationHistory.length > 0 ? (
                        donationHistory.map(record => (
                            <li key={record.id}>
                                <strong>{record.date}:</strong> Donated {record.unitsDonated} unit(s) at {record.location}.
                            </li>
                        ))
                    ) : (
                        <p>You have no donation history yet.</p>
                    )}
                </ul>
            </div>
            <div className="dashboard-card full-width-card">
                <h3>Upcoming Campaigns</h3>
                <ul className="campaign-list">
                    {campaigns.map(campaign => (
                        <li key={campaign.id}>
                           <div className="campaign-info">
                                <strong>{campaign.title}</strong>
                                <small>{campaign.date} at {campaign.location}</small>
                                <span>{campaign.pledges} / {campaign.goal} units pledged</span>
                           </div>
                           <button onClick={() => onPledge(campaign.id)}>Pledge to Donate</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DonorDashboard;

