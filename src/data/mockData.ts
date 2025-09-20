// --- DATA INTERFACES ---

export interface UserData {
    userId: string;
    username: string;
    email: string;
    role: 'donor' | 'organizer' | 'hospital';
    // Donor-specific
    bloodType?: string;
    // Organizer-specific
    organizationName?: string;
    // Hospital-specific
    hospitalName?: string;
}

export interface CampaignData {
    id: string;
    title: string;
    organizer: string;
    location: string;
    date: string;
    goal: number;
    pledges: number;
}

export interface DonationRecordData {
    id: string;
    donorId: string;
    date: string;
    location: string;
    unitsDonated: number;
}

export interface BloodRequestData {
    id: string;
    hospital: string;
    bloodType: string;
    unitsRequired: number;
    unitsFulfilled: number;
    status: 'urgent' | 'fulfilled';
    postedDate: string;
    log: string[];
}

export interface MockDatabase {
    users: UserData[];
    campaigns: CampaignData[];
    donationHistory: DonationRecordData[];
}


// --- MOCK DATABASE ---

export const mockDb: MockDatabase = {
    users: [
        { userId: 'donor-123', username: 'John Doe', email: 'john@test.com', role: 'donor', bloodType: 'B-' },
        { userId: 'donor-456', username: 'Jane Smith', email: 'jane@test.com', role: 'donor', bloodType: 'A+' },
        { userId: 'donor-789', username: 'Peter Jones', email: 'peter@test.com', role: 'donor', bloodType: 'O-' },
        { userId: 'organizer-abc', username: 'Red Cross Kollam', email: 'organizer@test.com', role: 'organizer', organizationName: 'Red Cross Kollam' },
        { userId: 'hospital-xyz', username: 'Dr. Emily Carter', email: 'hospital@test.com', role: 'hospital', hospitalName: 'Mercy Hospital, Kollam' },
    ],
    campaigns: [
        { id: 'camp-001', title: 'Community Blood Drive', organizer: 'Red Cross Kollam', location: 'Town Hall', date: '2025-09-28', goal: 50, pledges: 27 },
        { id: 'camp-002', title: 'Urgent B-Negative Replenishment Drive', organizer: 'Red Cross Kollam', location: 'Community Hall', date: '2025-10-05', goal: 20, pledges: 5 },
        { id: 'camp-003', title: 'University Campus Drive', organizer: 'Red Cross Kollam', location: 'University Auditorium', date: '2025-10-12', goal: 75, pledges: 45 },
    ],
    donationHistory: [
        { id: 'rec-01', donorId: 'donor-456', date: '2025-06-15', location: 'Town Hall', unitsDonated: 1 },
        { id: 'rec-02', donorId: 'donor-789', date: '2025-07-20', location: 'City Clinic', unitsDonated: 1 },
        { id: 'rec-03', donorId: 'donor-456', date: '2025-03-10', location: 'Red Cross Center', unitsDonated: 1 },
        { id: 'rec-04', donorId: 'donor-123', date: '2025-05-01', location: 'Mercy Hospital, Kollam', unitsDonated: 1 },
    ]
};

