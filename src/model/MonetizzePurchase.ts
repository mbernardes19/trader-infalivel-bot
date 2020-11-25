import Purchase from './Purchase';

export default class MonetizzePurchase extends Purchase {
    constructor(email: string, plano: string) {
        super(email, plano);
        this._coursePlatformService.platformName = 'Monetizze';
    }
}