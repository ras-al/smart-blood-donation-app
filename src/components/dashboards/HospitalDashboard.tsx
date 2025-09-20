import React, { useState } from 'react';
import { HospitalStaff } from '../../models/HospitalStaff';
import { MatchingService } from '../../services/MatchingService';
import { BloodRequestData } from '../../data/mockData';

interface HospitalDashboardProps {
    user: HospitalStaff;
}

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user }) => {
    const [requests, setRequests] = useState<BloodRequestData[]>([]);
    const [newRequestBloodType, setNewRequestBloodType] = useState<string>('B-');
    const [newRequestUnits, setNewRequestUnits] = useState<number>(2);
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleRequestBlood = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newRequestData: BloodRequestData = {
            id: `req-${Date.now()}`,
            hospital: user.hospitalName,
            bloodType: newRequestBloodType,
            unitsRequired: newRequestUnits,
            unitsFulfilled: 0,
            status: 'urgent',
            postedDate: new Date().toISOString().split('T')[0],
            log: ['Request posted. Initiating AI search...'],
        };
        
        setRequests(prev => [newRequestData, ...prev]);
        setModalMessage('Request posted. Initiating AI search...');
        setShowModal(true);

        const service = new MatchingService();
        
        const requestForService = {
            requestId: newRequestData.id,
            hospital: newRequestData.hospital,
            bloodType: newRequestData.bloodType,
            unitsRequired: newRequestData.unitsRequired,
            unitsFulfilled: newRequestData.unitsFulfilled,
            status: 'pending' as 'pending' | 'fulfilled',
            postedDate: new Date(newRequestData.postedDate),
            log: newRequestData.log,
        };
        
        // The service now returns the array of updates.
        const serviceUpdates = await service.findBloodSource(requestForService);

        // This function now iterates over the data returned from the service.
        const runUpdates = async () => {
            // Delays are kept here to control the speed of the UI simulation.
            const delays = [1500, 2000, 1500, 2000, 1000];

            for (let i = 0; i < serviceUpdates.length; i++) {
                const update = serviceUpdates[i];
                await new Promise(resolve => setTimeout(resolve, delays[i] || 1500));
                setModalMessage(prev => `${prev}\n- ${update.message}`);
                setRequests(currentRequests => currentRequests.map(r =>
                    r.id === newRequestData.id
                    ? {
                        ...r,
                        log: [...r.log, update.message],
                        unitsFulfilled: r.unitsFulfilled + (update.units || 0)
                      }
                    : r
                ));
            }
        };

        runUpdates();
    };

    const handleCloseRequest = (requestId: string) => {
        setRequests(currentRequests => currentRequests.map(r => 
            r.id === requestId ? { ...r, status: 'fulfilled' } : r
        ));
    };

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
                                    <small>Posted on {req.postedDate}</small>
                                    <span>Status: {req.status.toUpperCase()}</span>
                                </div>
                                <div className="request-actions">
                                    {req.status === 'urgent' && (
                                        <button onClick={() => handleCloseRequest(req.id)}>Mark Fulfilled</button>
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

