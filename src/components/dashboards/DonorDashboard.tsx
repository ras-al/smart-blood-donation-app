import React from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../App';
import { pledgeToCampaign } from '../../services/firestoreService';
import { Campaign, DonationRecord } from '../../models/DataModels';
import { Donor } from '../../models/Donor';
import LoadingSpinner from '../common/LoadingSpinner';

const DonorDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const donorUser = currentUser as Donor;

    const campaignsQuery = query(collection(db, 'campaigns'), orderBy('date', 'desc'));
    const historyQuery = currentUser
        ? query(
            collection(db, 'donationHistory'), 
            where('donorId', '==', currentUser.userId), 
            orderBy('date', 'desc')
          )
        : null;

    const [campaigns, campaignsLoading] = useFirestoreQuery<Campaign>(campaignsQuery);
    const [donationHistory, historyLoading] = useFirestoreQuery<DonationRecord>(historyQuery!);

    const totalUnitsDonated = donationHistory.reduce((acc, curr) => acc + curr.unitsDonated, 0);

    const handlePledge = async (campaignId: string) => {
        try {
            await pledgeToCampaign(campaignId);
            alert('Pledge successful! Thank you for your support.');
        } catch (error) {
            console.error("Error pledging to campaign:", error);
            alert('There was an error making your pledge. Please try again.');
        }
    };

    if (campaignsLoading || historyLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3>Profile Information</h3>
                <div className="profile-info">
                    <p><strong>Username:</strong> {donorUser.username}</p>
                    <p><strong>Email:</strong> {donorUser.email}</p>
                    <p><strong>Blood Type:</strong> <span className="blood-type-badge">{donorUser.bloodType}</span></p>
                    <p><strong>Location:</strong> {donorUser.location}</p>
                </div>
            </div>

            <div className="dashboard-card">
                <h3>Track Your Impact</h3>
                <div className="impact-score">
                    <h2>{totalUnitsDonated}</h2>
                    <p>Total Units Donated</p>
                </div>
                <p>Each donation can save up to 3 lives. Thank you!</p>
            </div>

            <div className="dashboard-card full-width-card">
                <h3>Donation History</h3>
                <ul>
                    {donationHistory.length > 0 ? (
                        donationHistory.map(record => (
                            <li key={record.id}>
                                <strong>{new Date(record.date.toDate()).toLocaleDateString()}:</strong> 
                                Donated {record.unitsDonated} unit(s) at {record.location}.
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
                                <strong>{campaign.name}</strong> {/* CORRECTED: from campaign.title */}
                                <small>{new Date(campaign.date.toDate()).toLocaleDateString()} at {campaign.location}</small>
                                <span>{campaign.pledges} / {campaign.goalUnits} units pledged</span> {/* CORRECTED: from campaign.goal */}
                           </div>
                           <button onClick={() => handlePledge(campaign.id!)}>Pledge to Donate</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DonorDashboard;