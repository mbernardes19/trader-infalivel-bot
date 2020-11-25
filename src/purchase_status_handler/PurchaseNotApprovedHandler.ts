import AbstractPurchaseStatusHandler from "./AbstractPurchaseStatusHandler"
import { PurchaseStatus } from "../model/PurchaseStatus";
import { log } from '../logger';
import { SceneContextMessageUpdate } from "telegraf/typings/stage";

const endConversation = async (ctx: SceneContextMessageUpdate) => {
    log(`Conversa com ${ctx.chat.id} finalizada`)
    ctx.scene.session.state = {};
    return ctx.scene.leave();
}

export default class PurchaseNotApprovedHandler extends AbstractPurchaseStatusHandler {

    async handle(purchaseStatus: PurchaseStatus) {
        if (purchaseStatus === PurchaseStatus.PURCHASE_NOT_APPROVED) {
            log(`Nenhuma compra feita pelo usuário ${this._ctx.chat.id} foi encontrada`)
            await this._ctx.reply('Nenhuma compra confirmada do seu usuário foi encontrada na Monetizze ou sua assinatura não está com status ativo.\n\nSe você realmente comprou, entre em contato com o suporte usando o comando /suporte')
            return await endConversation(this._ctx);
        } else {
            super.handle(purchaseStatus)
        }
    }
}