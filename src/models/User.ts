// The base User class from which other user roles will inherit.
export class User {
    userId: string;
    username: string;
    email: string;
    role: 'donor' | 'organizer' | 'hospital' | 'unknown';

    constructor(
        userId: string,
        username: string,
        email: string,
        role: 'donor' | 'organizer' | 'hospital' | 'unknown' = 'unknown'
    ) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }
}