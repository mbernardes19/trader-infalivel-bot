import { verifyUserPurchase, checkIfPaymentMethodIsBoleto, confirmPlano } from '../services/monetizze';
import { MonetizzePurchaseStatus } from './MonetizzePurchaseStatus';
import { logError, enviarMensagemDeErroAoAdmin } from '../logger';

export default class MonetizzePurchase {
    private _email: string
    private _status: MonetizzePurchaseStatus

    constructor(email: string) {
        this._email = email
    }

    setStatus(newStatus: MonetizzePurchaseStatus) {
        this._status = newStatus
    }

    private async verifyPurchase(): Promise<boolean> {
        try {
            return verifyUserPurchase(this._email)
        } catch (err) {
            logError(`Erro ao verificar compra de usuário na Monetizze`, err)
            await enviarMensagemDeErroAoAdmin(`Erro ao verificar compra de usuário na Monetizze`, err);
        }
    }

    private async checkPlano(): Promise<boolean> {
        try {
            return confirmPlano(this._email);
        } catch (err) {
            logError(`Erro ao verificar o plano da compra de usuário na Monetizze`, err)
            await enviarMensagemDeErroAoAdmin(`Erro ao verificar o plano da compra de usuário na Monetizze`, err);
        }
    }

    private async isPaymentBoleto(): Promise<boolean>{
        try {
            return checkIfPaymentMethodIsBoleto(this._email);
        } catch (err) {
            logError(`ERRO AO VERIFICAR SE PAGAMENTO FOI FEITO NO BOLETO E ESTÁ AGUARDANDO PAGAMENTO`, err)
            await enviarMensagemDeErroAoAdmin(`ERRO AO VERIFICAR SE PAGAMENTO FOI FEITO NO BOLETO E ESTÁ AGUARDANDO PAGAMENTO`, err);
        }
    }

    async getStatus() {
        const isPuchaseApproved = await this.verifyPurchase()

        if(isPuchaseApproved) {
            const isPlanoConfirmed = await this.checkPlano()
            if (isPlanoConfirmed) {
                this.setStatus(MonetizzePurchaseStatus.PURCHASE_APPROVED)
            } else {
                this.setStatus(MonetizzePurchaseStatus.PLANO_NOT_APPROVED)
            }
        } else {
            const isPaymentBoleto = await this.isPaymentBoleto()
            if (isPaymentBoleto) {
                const isPlanoConfirmed = await this.checkPlano()
                if (isPlanoConfirmed) {
                    this.setStatus(MonetizzePurchaseStatus.BOLETO_PAYMENT_NOT_APPROVED_YET)
                } else {
                    this.setStatus(MonetizzePurchaseStatus.PLANO_NOT_APPROVED)
                }
            } else {
                this.setStatus(MonetizzePurchaseStatus.PURCHASE_NOT_APPROVED)
            }
        }
        return this._status
    }
}