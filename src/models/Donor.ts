import { User } from './User';
import { Timestamp } from 'firebase/firestore';

// Donor Class inheriting from User
export class Donor extends User {
    bloodType: string;
    lastDonationDate: Timestamp | null;
    location: string;

    constructor(
        id: string,
        username: string,
        email: string,
        bloodType: string,
        location: string,
        lastDonationDate?: Timestamp
    ) {
        super(id, username, email, 'donor');
        this.bloodType = bloodType;
        this.location = location;
        this.lastDonationDate = lastDonationDate || null;
    }
}