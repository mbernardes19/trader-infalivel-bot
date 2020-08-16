import UserData from './UserData';

export default class User {
    private userData: UserData;

    constructor(userData: UserData) {
        this.userData = userData;
    }
}