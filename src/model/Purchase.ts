import { PurchaseStatus } from './PurchaseStatus';
import { logError, enviarMensagemDeErroAoAdmin } from '../logger';
import CoursePlatformService, { ApiResponse, Options } from '../services/coursePlatform';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

export default abstract class Purchase {
    protected _email: string
    protected _plano: string
    protected _status: PurchaseStatus
    protected _coursePlatformService: CoursePlatformService<Options, ApiResponse>;

    constructor(email: string, plano: string) {
        this._email = email
        this._plano = plano
    }

    setStatus(newStatus: PurchaseStatus) {
        this._status = newStatus
    }

    async verifyPurchase(): Promise<boolean> {
        try {
            return this._coursePlatformService.verifyUserPurchase(this._email)
        } catch (err) {
            logError(`Erro ao verificar compra de usuário na ${this._coursePlatformService.platformName}`, err)
            await enviarMensagemDeErroAoAdmin(`Erro ao verificar compra de usuário na ${this._coursePlatformService.platformName}`, err);
        }
    }

    private async checkProduct(): Promise<boolean> {
        try {
            return this._coursePlatformService.confirmProduct(this._email, this._plano);
        } catch (err) {
            logError(`Erro ao verificar o plano da compra de usuário na ${this._coursePlatformService.platformName}`, err)
            await enviarMensagemDeErroAoAdmin(`Erro ao verificar o plano da compra de usuário na ${this._coursePlatformService.platformName}`, err);
        }
    }

    private async isPaymentBoleto(): Promise<boolean>{
        try {
            return this._coursePlatformService.checkIfPaymentMethodIsBoleto(this._email);
        } catch (err) {
            logError(`ERRO AO VERIFICAR SE PAGAMENTO FOI FEITO NO BOLETO E ESTÁ AGUARDANDO PAGAMENTO`, err)
            await enviarMensagemDeErroAoAdmin(`ERRO AO VERIFICAR SE PAGAMENTO FOI FEITO NO BOLETO E ESTÁ AGUARDANDO PAGAMENTO`, err);
        }
    }

    async getStatus() {
        const isPuchaseApproved = await this.verifyPurchase()

        if(isPuchaseApproved) {
            const isPlanoConfirmed = await this.checkProduct()
            if (isPlanoConfirmed) {
                this.setStatus(PurchaseStatus.PURCHASE_APPROVED)
            } else {
                this.setStatus(PurchaseStatus.PLANO_NOT_APPROVED)
            }
        } else {
            const isPaymentBoleto = await this.isPaymentBoleto()
            if (isPaymentBoleto) {
                const isPlanoConfirmed = await this.checkProduct()
                if (isPlanoConfirmed) {
                    this.setStatus(PurchaseStatus.BOLETO_PAYMENT_NOT_APPROVED_YET)
                } else {
                    this.setStatus(PurchaseStatus.PLANO_NOT_APPROVED)
                }
            } else {
                this.setStatus(PurchaseStatus.PURCHASE_NOT_APPROVED)
            }
        }
        return this._status
    }
}