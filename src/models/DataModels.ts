// Contains other data-centric classes from the UML diagram.

export class Campaign {
    constructor(
        public campaignId: string,
        public name: string,
        public location: string,
        public date: Date,
        public goalUnits: number
    ) {}

    viewDetails() {
        return `Campaign: ${this.name} on ${this.date.toDateString()} at ${this.location}. Goal: ${this.goalUnits} units.`;
    }
}

export class BloodRequest {
    public status: 'pending' | 'fulfilled' = 'pending';
    public postedDate: Date = new Date();

    constructor(
        public requestId: string,
        public bloodType: string,
        public unitsRequired: number
    ) {}
}
