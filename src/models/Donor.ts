import { User } from './User';

// Donor Class inheriting from User
export class Donor extends User {
    bloodType: string;
    lastDonationDate: Date | null;
    location: string;

    constructor(id: string, username: string, email: string, bloodType: string, location: string, lastDonationDate?: Date) {
        super(id, username, email, 'donor');
        this.bloodType = bloodType;
        this.location = location;
        this.lastDonationDate = lastDonationDate || null;
    }

    viewDashboard() {
        console.log(`Displaying dashboard for Donor: ${this.username}`);
        // In a real app, this data would be calculated or fetched
        return {
            impact: "You've helped save 3 lives!",
            nextEligibleDate: "2025-12-25",
        };
    }
}
