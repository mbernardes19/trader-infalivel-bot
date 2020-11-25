import EduzzService from '../services/eduzz';
import Purchase from './Purchase';

export default class EduzzPurchase extends Purchase {

    constructor(email: string, plano: string, eduzzService: EduzzService) {
        super(email, plano);
        this._coursePlatformService = eduzzService;
    }
}