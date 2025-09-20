import { BloodRequest } from '../models/DataModels';
import { mockDb } from '../data/mockData';

// This is a placeholder type for the update objects.
type SearchUpdate = {
    message: string;
    units?: number;
};

export class MatchingService {
    /**
     * Simulates a two-phase search for blood and returns the sequence of events.
     * In a real application, this would involve complex logic and API calls.
     * @param request The blood request object.
     * @returns A promise that resolves to an array of search update events.
     */
    public async findBloodSource(request: BloodRequest): Promise<SearchUpdate[]> {
        console.log(`--- AI SEARCH INITIATED for Request ID: ${request.requestId} ---`);
        
        // This simulates the logic that would happen after a real API call.
        // The service is now responsible for generating the story of the search.
        const updates: SearchUpdate[] = [
            { message: "Phase 1: Checking partner hospital network..." },
            { message: `Partial Success: 1 unit of ${request.bloodType} blood located at City Hospital.`, units: 1 },
            { message: "Phase 2: Searching for voluntary donors..." },
        ];

        // Simulate finding a donor from the mock data.
        const donors = (mockDb as any).users.filter((user: { role: string; }) => user.role === 'donor');
        const foundDonor = donors.find((d: { bloodType: string; }) => d.bloodType === request.bloodType);

        if (foundDonor) {
            updates.push({ message: `Success: Voluntary donor '${foundDonor.userId}' found and notified.`, units: 1 });
        } else {
            updates.push({ message: `Warning: No suitable voluntary donors found for ${request.bloodType}.` });
        }
        
        updates.push({ message: "Search complete." });

        console.log("--- AI SEARCH COMPLETE ---");
        return updates;
    }
}

