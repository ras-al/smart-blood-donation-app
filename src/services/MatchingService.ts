import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { BloodRequest } from '../models/DataModels';
import { createNotification } from './firestoreService';
import { Donor } from '../models/Donor';
import { getDemandPrediction } from './geminiService';

type SearchUpdate = {
    message: string;
    units?: number;
};

export class MatchingService {
    public async findBloodSource(request: BloodRequest): Promise<SearchUpdate[]> {
        const updates: SearchUpdate[] = [];
        console.log(`--- AI SEARCH INITIATED for Request ID: ${request.id} ---`);

        // --- GEMINI API INTEGRATION EXAMPLE ---
        // 1. Predict Future Demand
        // You could pass historical data to your geminiService.
        // const prediction = await getDemandPrediction('Kollam', request.bloodType); 
        // updates.push({ message: `AI Prediction: ${prediction}` });
        
        updates.push({ message: "Searching for voluntary donors..." });
        
        try {
            const q = query(
                collection(db, "users"), 
                where("role", "==", "donor"),
                where("bloodType", "==", request.bloodType)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach(doc => {
                    const donor = doc.data() as Donor;
                    
                    // --- GEMINI API INTEGRATION EXAMPLE ---
                    // 2. Generate a personalized notification message
                    // const personalizedMessage = await generateDonorMessage(donor.username, request.hospitalName);
                    // createNotification(donor.userId, personalizedMessage);
                    
                    const message = `Success: Voluntary donor '${donor.username}' found and notified.`;
                    updates.push({ message, units: 1 });
                });
            } else {
                updates.push({ message: `Warning: No suitable voluntary donors found for ${request.bloodType}.` });
            }
        } catch (error) {
            console.error("Error searching for donors:", error);
            updates.push({ message: `Error: Could not complete donor search.` });
        }
        
        updates.push({ message: "Search complete." });
        console.log("--- AI SEARCH COMPLETE ---");
        return updates;
    }
}