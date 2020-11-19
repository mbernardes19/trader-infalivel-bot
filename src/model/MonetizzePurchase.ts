import Purchase from './Purchase';

export default class MonetizzePurchase extends Purchase {
    constructor(email: string) {
        super(email);
        this._coursePlatformService.platformName = 'Monetizze';
    }
}