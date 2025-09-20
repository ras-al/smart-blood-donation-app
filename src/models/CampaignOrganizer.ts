import { User } from './User';

// CampaignOrganizer Class inheriting from User
export class CampaignOrganizer extends User {
    organizationName: string;

    constructor(
        id: string,
        username: string,
        email: string,
        organizationName: string
    ) {
        super(id, username, email, 'organizer');
        this.organizationName = organizationName;
    }
}