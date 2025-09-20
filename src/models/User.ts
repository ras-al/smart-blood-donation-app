// The base User class from which other user roles will inherit.
export class User {
    // Properties
    userId: string;
    username: string;
    email: string;
    role: 'donor' | 'organizer' | 'hospital' | 'unknown';

    // Constructor with simulated overloading for flexibility
    constructor(idOrData: string | { userId: string; username: string; email: string; role: any }, username?: string, email?: string, role?: any) {
        if (typeof idOrData === 'string') {
            this.userId = idOrData;
            this.username = username || '';
            this.email = email || '';
            this.role = role || 'unknown';
        } else {
            this.userId = idOrData.userId;
            this.username = idOrData.username;
            this.email = idOrData.email;
            this.role = idOrData.role;
        }
    }
}
