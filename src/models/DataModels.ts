// src/models/DataModels.ts
import { Timestamp } from 'firebase/firestore';

export class Campaign {
    id?: string;
    name: string; 
    organizerId: string;
    organizationName: string;
    location: string;
    date: Timestamp;
    goalUnits: number;
    pledges: number;
    createdAt: Timestamp;

    constructor(data: Partial<Campaign> = {}) {
        this.id = data.id;
        this.name = data.name || '';
        this.organizerId = data.organizerId || '';
        this.organizationName = data.organizationName || '';
        this.location = data.location || '';
        this.date = data.date || Timestamp.now();
        this.goalUnits = data.goalUnits || 0;
        this.pledges = data.pledges || 0;
        this.createdAt = data.createdAt || Timestamp.now();
    }
}

export class BloodRequest {
    id?: string;
    hospitalId: string;
    hospitalName: string;
    bloodType: string;
    unitsRequired: number;
    unitsFulfilled: number;
    status: 'urgent' | 'fulfilled';
    postedDate: Timestamp;
    log: string[];

    constructor(data: Partial<BloodRequest> = {}) {
        this.id = data.id;
        this.hospitalId = data.hospitalId || '';
        this.hospitalName = data.hospitalName || '';
        this.bloodType = data.bloodType || '';
        this.unitsRequired = data.unitsRequired || 0;
        this.unitsFulfilled = data.unitsFulfilled || 0;
        this.status = data.status || 'urgent';
        this.postedDate = data.postedDate || Timestamp.now();
        this.log = data.log || [];
    }
}

export class DonationRecord {
    id?: string;
    donorId: string;
    date: Timestamp;
    location: string;
    unitsDonated: number;
    campaignId?: string;

    constructor(data: Partial<DonationRecord> = {}) {
        this.id = data.id;
        this.donorId = data.donorId || '';
        this.date = data.date || Timestamp.now();
        this.location = data.location || '';
        this.unitsDonated = data.unitsDonated || 0;
        this.campaignId = data.campaignId;
    }
}

export interface Notification {
    id?: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: Timestamp;
}

export class BloodInventory {
    id?: string; // combination of hospitalId_bloodType for a unique ID
    hospitalId: string;
    bloodType: string;
    units: number;

    constructor(data: Partial<BloodInventory> = {}) {
        this.id = data.id;
        this.hospitalId = data.hospitalId || '';
        this.bloodType = data.bloodType || '';
        this.units = data.units || 0;
    }
}