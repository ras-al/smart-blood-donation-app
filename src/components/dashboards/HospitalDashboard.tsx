import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../App';
import { createBloodRequest, updateBloodRequest, updateInventory, getInventoryForHospital, deleteBloodRequest } from '../../services/firestoreService';
import { MatchingService } from '../../services/MatchingService';
import { BloodRequest, BloodInventory } from '../../models/DataModels';
import LoadingSpinner from '../common/LoadingSpinner';
import { HospitalStaff } from '../../models';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [newRequestBloodType, setNewRequestBloodType] = useState<string>('B-');
    const [newRequestUnits, setNewRequestUnits] = useState<number>(2);
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [inventory, setInventory] = useState<Map<string, number>>(new Map());
    const [inventoryLoading, setInventoryLoading] = useState(true);

    const requestsQuery = currentUser
        ? query(
            collection(db, 'bloodRequests'),
            where('hospitalId', '==', currentUser.userId),
            orderBy('postedDate', 'desc')
          )
        : null;

    const [requests, requestsLoading] = useFirestoreQuery<BloodRequest>(requestsQuery!);

    useEffect(() => {
        const fetchInventory = async () => {
            if (currentUser) {
                setInventoryLoading(true);
                const invData = await getInventoryForHospital(currentUser.userId);
                const invMap = new Map<string, number>();
                bloodTypes.forEach(bt => invMap.set(bt, 0)); // Initialize all types
                invData.forEach(item => invMap.set(item.bloodType, item.units));
                setInventory(invMap);
                setInventoryLoading(false);
            }
        };
        fetchInventory();
    }, [currentUser]);

    const handleInventoryChange = (bloodType: string, units: number) => {
        const newInventory = new Map(inventory);
        newInventory.set(bloodType, units);
        setInventory(newInventory);
    };

    const handleSaveInventory = async (bloodType: string) => {
        const units = inventory.get(bloodType);
        if (currentUser && units !== undefined) {
            try {
                await updateInventory(currentUser.userId, bloodType, units);
                alert(`${bloodType} inventory updated!`);
            } catch (error) {
                console.error("Error updating inventory:", error);
                alert('Failed to update inventory.');
            }
        }
    };
    
    const handleRequestBlood = async (e: React.FormEvent) => {
        e.preventDefault();
        const hospitalUser = currentUser as HospitalStaff;

        const newRequestData = {
            bloodType: newRequestBloodType,
            unitsRequired: newRequestUnits,
            hospitalId: hospitalUser.userId,
            hospitalName: hospitalUser.hospitalName,
        };

        setModalMessage('Posting request and initiating AI search...');
        setShowModal(true);

        try {
            const docRef = await createBloodRequest(newRequestData, hospitalUser.userId, hospitalUser.hospitalName);
            const service = new MatchingService();
            const tempRequest = new BloodRequest({ ...newRequestData, id: docRef.id, hospitalName: hospitalUser.hospitalName });
            const serviceUpdates = await service.findBloodSource(tempRequest);
            const updatedLog = ['Request posted. Initiating search...', ...serviceUpdates.map(u => u.message)];
            await updateBloodRequest(docRef.id, { log: updatedLog });
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

    const handleDeleteRequest = async (requestId: string) => {
        if (window.confirm('Are you sure you want to cancel this request? This action cannot be undone.')) {
            try {
                await deleteBloodRequest(requestId);
                alert('Request cancelled.');
            } catch (error) {
                console.error("Error cancelling request:", error);
                alert('Failed to cancel request.');
            }
        }
    };
    
    if (requestsLoading || inventoryLoading) {
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
                                {bloodTypes.map(bt => <option key={bt}>{bt}</option>)}
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
                    <h3>Manage Blood Inventory</h3>
                    <ul className="inventory-list">
                        {bloodTypes.map(bt => (
                            <li key={bt} className="inventory-item">
                                <span className="blood-type-label">{bt}</span>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={inventory.get(bt) || 0}
                                    onChange={(e) => handleInventoryChange(bt, parseInt(e.target.value, 10))}
                                />
                                <button className="secondary" onClick={() => handleSaveInventory(bt)}>Save</button>
                            </li>
                        ))}
                    </ul>
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
                                        <>
                                            <button onClick={() => handleMarkFulfilled(req.id!)}>Mark Fulfilled</button>
                                            <button className="secondary" onClick={() => handleDeleteRequest(req.id!)}>Cancel</button>
                                        </>
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