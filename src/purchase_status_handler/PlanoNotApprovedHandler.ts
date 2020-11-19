import AbstractPurchaseStatusHandler from "./AbstractPurchaseStatusHandler"
import { PurchaseStatus } from "../model/PurchaseStatus";
import { log } from '../logger';
import CacheService from '../services/cache';

const endConversation = async (ctx) => {
    log(`Conversa com ${ctx.chat.id} finalizada`)
    CacheService.clearAllUserData();
    return ctx.scene.leave();
}

export default class PlanoNotApprovedHandler extends AbstractPurchaseStatusHandler {

    async handle(purchaseStatus: PurchaseStatus) {
        if (purchaseStatus === PurchaseStatus.PLANO_NOT_APPROVED) {
            log(`Plano informado por ${this._ctx.chat.id} não é o mesmo da compra`)
            await this._ctx.reply('O plano que você selecionou não é o mesmo que consta na compra na Monetizze. Por favor comece nossa conversa novamente com /reiniciar e atribua o plano correto.');
            return await endConversation(this._ctx);
        } else {
            super.handle(purchaseStatus)
        }
    }
}