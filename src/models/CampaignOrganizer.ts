import { User } from './User';
import { Campaign } from './DataModels';

// CampaignOrganizer Class inheriting from User
export class CampaignOrganizer extends User {
    organizationName: string;

    constructor(id: string, username: string, email: string, organizationName: string) {
        super(id, username, email, 'organizer');
        this.organizationName = organizationName;
    }

    createCampaign(campaignName: string, goal: number): Campaign {
        console.log(`${this.organizationName} is creating campaign: ${campaignName} with goal ${goal} units.`);
        // This would typically save the campaign to the database
        const newCampaign = new Campaign(
            Math.random().toString(36).substr(2, 9), // dummy ID
            campaignName,
            "City Center",
            new Date(),
            goal
        );
        console.log("New Campaign Created:", newCampaign);
        return newCampaign;
    }
}
