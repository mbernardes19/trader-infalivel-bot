import { BaseScene, Markup, Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { cartao, boleto } from '../services/validate';

const paymentScene = new BaseScene('payment')

paymentScene.action('cartao_de_credito', async (ctx) => {
    await ctx.answerCbQuery();
    await savePaymentMethod('cartao_de_credito');
    await askForPlano(ctx)
    await ctx.scene.enter('plano');
})

paymentScene.action('boleto', async (ctx) => {
    await ctx.answerCbQuery();
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
    CacheService.saveUserData('forma_de_pagamento', paymentMethod);
    log(`Forma de pagamento definida ${paymentMethod}`);
}

const showPlanoOptions = async (ctx) => {
    const planos = Markup.inlineKeyboard([
        [Markup.callbackButton('🥈 Prata/Silver', '78914')],
        [Markup.callbackButton('🥇 Gold', '90965')],
        [Markup.callbackButton('💎 Diamond', '90966')],
        [Markup.callbackButton('💎⬛ Black Diamond', '91261')]
    ])
    await ctx.reply("Qual foi o plano que você contratou?", Extra.markup(planos))
}

const askForPlano = async (ctx) => {
    await ctx.reply('Certo!');
    await ctx.reply('Vou precisar de mais alguns dados pra confirmar o pagamento no servidor da Monetizze, tudo bem?');
    await showPlanoOptions(ctx);
}

export default paymentScene;
