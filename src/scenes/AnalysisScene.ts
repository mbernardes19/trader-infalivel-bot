import CacheService from '../services/cache';
import { logError, log } from '../logger';
import Scene from '../model/Scene';
import handlePurchaseStatus from '../purchase_status_handler/index';
import EduzzPurchase from '../model/EduzzPurchase';
import EduzzService from '../services/eduzz';
import { EduzzAuthCredentials } from '../interfaces/Eduzz';

const analysisScene = new Scene('analysis')

analysisScene.onEnter(async ctx => {
    await ctx.reply('Verificando sua compra nos servidores da Eduzz...');
    const email = CacheService.getEmail();
    const eduzzService = await authenticateOnEduzz();
    const eduzzPurchase = new EduzzPurchase(email, eduzzService);
    let purchaseStatus;
    try {
        purchaseStatus = await eduzzPurchase.getStatus();
    } catch (err) {
        await ctx.reply('Me desculpe... Ocorreu um erro ao verificar a sua compra na Eduzz. Por favor, tente iniciar uma conversa comigo novamente.');
        logError(`Erro ao pegar status da compra na Eduzz`, err);
        return await endConversation(ctx);
    }

    handlePurchaseStatus(ctx, purchaseStatus);
})

const authenticateOnEduzz = async (): Promise<EduzzService> => {
    const eduzzService = new EduzzService();
    const authCredentials: EduzzAuthCredentials = {email: 'grupocollab@gmail.com', publicKey: '33634949', apiKey: '4366B150AE'}
    await eduzzService.authenticate(authCredentials);
    return eduzzService;
}

const endConversation = async (ctx) => {
    log(`Conversa com ${ctx.chat.id} finalizada`)
    CacheService.clearAllUserData();
    return ctx.scene.leave();
}

export default analysisScene;