import { User } from './User';

// HospitalStaff Class inheriting from User
export class HospitalStaff extends User {
    hospitalName: string;

    constructor(
        id: string,
        username: string,
        email: string,
        hospitalName: string
    ) {
        super(id, username, email, 'hospital');
        this.hospitalName = hospitalName;
    }
}