// src/services/InventoryService.ts
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { PartnerHospital } from '../models/PartnerHospital';

// Mock function 
const checkPartnerStock = async (hospital: PartnerHospital, bloodType: string): Promise<number> => {
    console.log(`Checking stock at ${hospital.name} via ${hospital.apiEndpoint} for ${bloodType}...`);
    // In a real-world scenario, this would be an actual API call (e.g., using fetch)
    // For this simulation, we'll return a random amount of units
    // Let's give City Hospital a unit of B- to match the scenario
    if (hospital.name === "City Hospital" && bloodType === "B-") {
        return 1;
    }
    return 0;
};


export class InventoryService {
    /**
     * Checks all registered partner hospitals for a specific blood type.
     * @param requestingHospitalId - The ID of the hospital making the request, to avoid checking itself.
     * @param bloodType - The blood type to search for.
     * @returns A promise that resolves with an object containing the hospital and the units found.
     */
    public async checkStock(requestingHospitalId: string, bloodType: string): Promise<{ hospital: PartnerHospital; units: number } | null> {
        // In a real app, you might query a "partnerHospitals" collection.
        // For this simulation, we will hardcode the partner hospitals from the scenario.
        const partnerHospitals: PartnerHospital[] = [
            new PartnerHospital("city_hospital_id", "City Hospital", "Kollam", "https://city-hospital/api/inventory"),
            new PartnerHospital("district_clinic_id", "District Clinic", "Kollam", "https://district-clinic/api/inventory")
        ];

        for (const hospital of partnerHospitals) {
            // Skip the hospital that is making the request
            if (hospital.id === requestingHospitalId) {
                continue;
            }

            const units = await checkPartnerStock(hospital, bloodType);
            if (units > 0) {
                // Return the first hospital found with stock
                return { hospital, units };
            }
        }
        return null; // No stock found in any partner hospital
    }
}