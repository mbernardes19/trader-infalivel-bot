import CacheService from '../services/cache';
import { logError, log } from '../logger';
import Scene from '../model/Scene';
import MonetizzePurchase from '../model/MonetizzePurchase';
import handlePurchaseStatus from '../purchase_status_handler/index';

const analysisScene = new Scene('analysis')

analysisScene.onEnter(async ctx => {
    await ctx.reply('Verificando sua compra nos servidores da Monetizze...');
    const email = CacheService.getEmail();
    const monetizzePurchase = new MonetizzePurchase(email);
    let purchaseStatus;
    try {
        purchaseStatus = await monetizzePurchase.getStatus();
    } catch (err) {
        await ctx.reply('Me desculpe... Ocorreu um erro ao verificar a sua compra na Monetizze. Por favor, tente iniciar uma conversa comigo novamente.');
        logError(`Erro ao pegar status da compra na Monetizze`, err);
        return await endConversation(ctx);
    }

    handlePurchaseStatus(ctx, purchaseStatus);
})

const endConversation = async (ctx) => {
    log(`Conversa com ${ctx.chat.id} finalizada`)
    CacheService.clearAllUserData();
    return ctx.scene.leave();
}

export default analysisScene;