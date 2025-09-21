// src/models/PartnerHospital.ts
export class PartnerHospital {
    id: string;
    name: string;
    location: string;
    apiEndpoint: string;

    constructor(id: string, name: string, location: string, apiEndpoint: string) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.apiEndpoint = apiEndpoint;
    }
}