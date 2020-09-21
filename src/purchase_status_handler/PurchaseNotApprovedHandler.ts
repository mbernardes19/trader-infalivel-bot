import AbstractPurchaseStatusHandler from "./AbstractPurchaseStatusHandler"
import { MonetizzePurchaseStatus } from "../model/MonetizzePurchaseStatus";
import { log } from '../logger';
import CacheService from '../services/cache';

const endConversation = async (ctx) => {
    log(`Conversa com ${ctx.chat.id} finalizada`)
    CacheService.clearAllUserData();
    return ctx.scene.leave();
}

export default class PurchaseNotApprovedHandler extends AbstractPurchaseStatusHandler {

    async handle(purchaseStatus: MonetizzePurchaseStatus) {
        if (purchaseStatus === MonetizzePurchaseStatus.PURCHASE_NOT_APPROVED) {
            log(`Nenhuma compra feita pelo usuário ${this._ctx.chat.id} foi encontrada`)
            await this._ctx.reply('Nenhuma compra confirmada do seu usuário foi encontrada na Monetizze ou sua assinatura não está com status ativo.\n\nSe você realmente comprou, entre em contato com o suporte usando o comando /suporte')
            return await endConversation(this._ctx);
        } else {
            super.handle(purchaseStatus)
        }
    }
}