import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { BloodRequest } from '../models/DataModels';
import { createNotification } from './firestoreService';
import { Donor } from '../models/Donor';
import { generateDonorMessage, getDemandPrediction } from './geminiService';
import { InventoryService } from './InventoryService'; 
type SearchUpdate = {
    message: string;
    units?: number;
};

export class MatchingService {
    private inventoryService: InventoryService;

    constructor() {
        this.inventoryService = new InventoryService();
    }

    public async findBloodSource(request: BloodRequest): Promise<SearchUpdate[]> {
        const updates: SearchUpdate[] = [];
        let unitsStillNeeded = request.unitsRequired;

        console.log(`--- AI SEARCH INITIATED for Request ID: ${request.id} ---`);

        // --- PHASE 1: Check Partner Hospital Network ---
        updates.push({ message: "Phase 1: Checking partner hospital network..." });
        try {
            const stockCheck = await this.inventoryService.checkStock(request.hospitalId, request.bloodType);
            if (stockCheck && stockCheck.units > 0) {
                const unitsFound = Math.min(stockCheck.units, unitsStillNeeded);
                unitsStillNeeded -= unitsFound;
                const message = `Partial Success: ${unitsFound} unit(s) of ${request.bloodType} blood located at ${stockCheck.hospital.name} and is being reserved.`;
                updates.push({ message, units: unitsFound });
            } else {
                updates.push({ message: "No stock found in partner hospitals." });
            }
        } catch (error) {
            console.error("Error checking partner hospital stock:", error);
            updates.push({ message: "Error: Could not complete partner hospital search." });
        }


        // --- PHASE 2: Find a Voluntary Donor (if needed) ---
        if (unitsStillNeeded > 0) {
            updates.push({ message: "Phase 2: Searching for voluntary donors..." });
            try {
                const q = query(
                    collection(db, "users"),
                    where("role", "==", "donor"),
                    where("bloodType", "==", request.bloodType)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const donors = querySnapshot.docs.map(doc => doc.data() as Donor);
                    // Notify as many donors as units are needed
                    const donorsToNotify = donors.slice(0, unitsStillNeeded);

                    await Promise.all(donorsToNotify.map(async (donor) => {
                        const personalizedMessage = await generateDonorMessage(donor.username, request.hospitalName);
                        await createNotification(donor.userId, personalizedMessage);
                        const message = `Success: Voluntary donor '${donor.username}' found and notified.`;
                        updates.push({ message, units: 1 });
                        unitsStillNeeded--; // Decrement for each donor notified
                    }));
                }

                if (unitsStillNeeded === request.unitsRequired) {
                    updates.push({ message: `Warning: No suitable voluntary donors found for ${request.bloodType}.` });
                }

            } catch (error) {
                console.error("Error searching for donors:", error);
                updates.push({ message: `Error: Could not complete donor search.` });
            }
        } else {
            updates.push({ message: "Request fully met by partner hospital inventory." });
        }

        updates.push({ message: "Search complete." });
        console.log("--- AI SEARCH COMPLETE ---");
        return updates;
    }
}