import HttpService from './http';
import { EduzzResponse, EduzzSaleOptions, EduzzSaleStatus, EduzzAuthCredentials } from '../interfaces/Eduzz';
import CoursePlatformService from './coursePlatform';
import { PlanosEduzz } from '../model/Planos';

export default class EduzzService extends CoursePlatformService<EduzzSaleOptions, EduzzResponse> {
    private _httpService: HttpService;
    private _jwtToken: string;
    private readonly MIN_DATE = '2020-09-05';

    constructor() {
        super();
        this.platformName = 'Eduzz';
        this._httpService = new HttpService('https://api2.eduzz.com')
    }

    async authenticate(authCredentials: EduzzAuthCredentials) {
        const {email, publicKey, apiKey} = authCredentials;
        let response;
        try {
            response = await this._httpService.post('/credential/generate_token', {email, publickey: publicKey, apikey: apiKey});
            this._jwtToken = response.data.data.token;
        } catch (err) {
            console.log(err);
        }
    }

    async getPurchases(options?: EduzzSaleOptions): Promise<EduzzResponse> {
        const todayDate = new Date().toISOString().match(/.+(?=T)/gm)[0];
        let response;
        try {
            response = await this._httpService.get('/sale/get_sale_list', {'Token': this._jwtToken}, { start_date: this.MIN_DATE, end_date: todayDate, ...options});
            return response.data;
        } catch (err) {
            console.log(err);
        }
    }

    async verifyUserPurchase(userEmail: string): Promise<boolean> {
        const salesResponse = await this.getPurchases({client_email: userEmail})
        if (salesResponse.paginator.totalRows > 0) {
            if (salesResponse.data[0].sale_status === EduzzSaleStatus.PAGA) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async confirmProduct(userEmail: string, plano?: string): Promise<boolean> {
        const salesResponse = await this.getPurchases({client_email: userEmail})
        if (salesResponse.data[0].content_id === parseInt(PlanosEduzz.BASIC) || salesResponse.data[0].content_id === parseInt(PlanosEduzz.basic)) {
            if (plano === PlanosEduzz.BASIC || plano === PlanosEduzz.basic) {
                return true;
            } else {
                return false;
            }
        }
        if (salesResponse.data[0].content_id !== parseInt(plano)) {
            return false;
        } else {
            return true;
        }
    }

    async checkIfPaymentMethodIsBoleto(userEmail: string): Promise<boolean> {
        const salesResponse = await this.getPurchases({client_email: userEmail});
        if (salesResponse.data[0] && salesResponse.data[0].sale_payment_method.includes('Boleto')) {
            return true;
        } else {
            return false;
        }
    }

    async getUserSubscriptionDate(userEmail: string) {
        const salesResponse = await this.getPurchases({client_email: userEmail});
        const responseData = salesResponse.data[0]
        const subDate = responseData.date_payment || responseData.date_update || responseData.date_create
        return subDate as any;
    }
}