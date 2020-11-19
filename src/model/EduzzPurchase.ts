import EduzzService from '../services/eduzz';
import Purchase from './Purchase';

export default class EduzzPurchase extends Purchase {

    constructor(email: string, eduzzService: EduzzService) {
        super(email);
        this._coursePlatformService = eduzzService;
    }
}