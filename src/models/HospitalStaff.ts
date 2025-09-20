import { User } from './User';
import { BloodRequest } from './DataModels';
import { MatchingService } from '../services/MatchingService';

// HospitalStaff Class inheriting from User
export class HospitalStaff extends User {
    hospitalName: string;

    constructor(id: string, username: string, email: string, hospitalName: string) {
        super(id, username, email, 'hospital');
        this.hospitalName = hospitalName;
    }

    async postBloodRequest(bloodType: string, unitsRequired: number): Promise<BloodRequest> {
        const requestId = Math.random().toString(36).substr(2, 9); // dummy ID
        const request = new BloodRequest(requestId, bloodType, unitsRequired);
        console.log(`${this.hospitalName} posted a request for ${unitsRequired} units of ${bloodType}.`);

        // Using the AI Matching Service to find donors
        const matchingService = new MatchingService();
        const matchedDonors = await matchingService.findBloodSource(request);

        console.log("AI Matched Donors:", matchedDonors);
        // Next steps would be to notify these donors via the system
        return request;
    }
}
