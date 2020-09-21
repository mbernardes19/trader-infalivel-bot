import { Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { cartao, boleto } from '../services/validate';
import Scene from '../model/Scene';
import Keyboard from '../model/Keyboard';

const paymentScene = new Scene('payment')

paymentScene.onAction('cartao_de_credito', async (ctx) => {
    await savePaymentMethod('cartao_de_credito');
    await askForPlano(ctx)
    await ctx.scene.enter('plano');
})

paymentScene.onAction('boleto', async (ctx) => {
    await savePaymentMethod('boleto');
    await askForPlano(ctx)
    await ctx.scene.enter('plano');
})

paymentScene.use(async (ctx) => {
    if (cartao(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePaymentMethod('cartao_de_credito');
        await askForPlano(ctx);
        return await ctx.scene.enter('plano');
    }
    if (boleto(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePaymentMethod('boleto');
        await askForPlano(ctx);
        return await ctx.scene.enter('plano');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePaymentMethod = async (paymentMethod) => {
    CacheService.savePaymentMethod(paymentMethod);
    log(`Forma de pagamento definida ${paymentMethod}`);
}

const showPlanoOptions = async (ctx) => {
    log(`Enviando opções de PLANO para ${ctx.chat.id}`)
    try {
        await ctx.reply("Qual foi o plano que você contratou?", Extra.markup(Keyboard.PLANOS_OPTIONS))
    } catch (err) {
        log(`ERRO AO ENVIAR MENSAGEM DE PEDIDO DE PLANO ${err}`)
    }
}

const askForPlano = async (ctx) => {
    try {
        await ctx.reply('Certo!');
        await ctx.reply('Vou precisar de mais alguns dados pra confirmar o pagamento no servidor da Monetizze, tudo bem?');
    } catch (err) {
        log(`ERRO AO ENVIAR MENSAGEM ${err}`)
    }
    await showPlanoOptions(ctx);
}

export default paymentScene;
