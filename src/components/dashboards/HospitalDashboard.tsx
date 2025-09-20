import React, { useState } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../App';
import { createBloodRequest, updateBloodRequest } from '../../services/firestoreService';
import { MatchingService } from '../../services/MatchingService';
import { BloodRequest } from '../../models/DataModels';
import LoadingSpinner from '../common/LoadingSpinner';
import { HospitalStaff } from '../../models';

const HospitalDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [newRequestBloodType, setNewRequestBloodType] = useState<string>('B-');
    const [newRequestUnits, setNewRequestUnits] = useState<number>(2);
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    const requestsQuery = currentUser
        ? query(
            collection(db, 'bloodRequests'),
            where('hospitalId', '==', currentUser.userId),
            orderBy('postedDate', 'desc')
          )
        : null;

    const [requests, requestsLoading] = useFirestoreQuery<BloodRequest>(requestsQuery!);

    const handleRequestBlood = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const hospitalUser = currentUser as HospitalStaff;

        const newRequestData = {
            bloodType: newRequestBloodType,
            unitsRequired: newRequestUnits,
            hospitalId: hospitalUser.userId,
            hospitalName: hospitalUser.hospitalName
        };

        setModalMessage('Posting request and initiating AI search...');
        setShowModal(true);

        try {
            const docRef = await createBloodRequest(newRequestData, hospitalUser.userId, hospitalUser.hospitalName);
            const service = new MatchingService();
            
            const tempRequest = new BloodRequest({
                ...newRequestData,
                id: docRef.id,
            });

            const serviceUpdates = await service.findBloodSource(tempRequest);

            const updatedLog = ['Request posted. Initiating search...', ...serviceUpdates.map(u => u.message)];
            
            await updateBloodRequest(docRef.id, { 
                log: updatedLog,
            });

            setModalMessage(updatedLog.join('\n'));

        } catch (error) {
            console.error("Error creating blood request:", error);
            setModalMessage('Failed to post blood request.');
        }
    };

    const handleMarkFulfilled = async (requestId: string) => {
        try {
            await updateBloodRequest(requestId, { status: 'fulfilled' });
        } catch (error) {
            console.error("Error updating request status:", error);
        }
    };
    
    if (requestsLoading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>AI Search Log</h3>
                        <pre>{modalMessage}</pre>
                        <button onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Post Urgent Request</h3>
                    <form onSubmit={handleRequestBlood}>
                        <div className="form-group">
                            <label htmlFor="bloodType">Blood Type</label>
                            <select id="bloodType" value={newRequestBloodType} onChange={e => setNewRequestBloodType(e.target.value)}>
                                <option>A+</option><option>A-</option>
                                <option>B+</option><option>B-</option>
                                <option>AB+</option><option>AB-</option>
                                <option>O+</option><option>O-</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="units">Units Required</label>
                            <input type="number" id="units" min="1" value={newRequestUnits} onChange={e => setNewRequestUnits(parseInt(e.target.value, 10))} />
                        </div>
                        <button type="submit">Post Request</button>
                    </form>
                </div>

                <div className="dashboard-card full-width-card">
                    <h3>Active Requests</h3>
                    <ul className="request-list">
                        {requests.length > 0 ? requests.map(req => (
                            <li key={req.id} className={`request-item status-${req.status}`}>
                                <div className="request-info">
                                    <strong>{req.bloodType} ({req.unitsFulfilled}/{req.unitsRequired} units)</strong>
                                    <small>Posted on {new Date(req.postedDate?.toDate()).toLocaleString()}</small>
                                    <span>Status: {req.status.toUpperCase()}</span>
                                </div>
                                <div className="request-actions">
                                    {req.status === 'urgent' && (
                                        <button onClick={() => handleMarkFulfilled(req.id!)}>Mark Fulfilled</button>
                                    )}
                                </div>
                            </li>
                        )) : (
                            <p>No active requests.</p>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default HospitalDashboard;