import { BaseScene, Markup, Extra } from 'telegraf';
import { log } from '../logger';
import CacheService from '../services/cache';


const wizard = new BaseScene('welcome')
wizard.enter(async (ctx) => {
    log('primeira mensagem').info();
    CacheService.saveUserData(ctx, 'teste', 'oi');
    await ctx.reply('Olá! Seja bem-vindo!');
    await ctx.reply('Vou precisar confirmar a sua forma de pagamento!');
    const pagamento = Markup.inlineKeyboard([
        [Markup.callbackButton('💳 Cartão de Crédito', 'cartao_de_credito')],
        [Markup.callbackButton('📄 Boleto', 'boleto')]
    ])
    await ctx.reply("Qual foi sua forma de pagamento", Extra.markup(pagamento))
    ctx.scene.enter('payment')
})

export default wizard;