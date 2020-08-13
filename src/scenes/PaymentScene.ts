import { BaseScene } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';

const wizard = new BaseScene('payment')
wizard.action('cartao_de_credito', async (ctx) => {
    await ctx.answerCbQuery();
    ctx.scene.state = {formaDePagamento:'cartao_de_credito'};
    CacheService.saveUserData(ctx, 'forma_de_pagamento', 'cartao_de_credito');
    await ctx.reply('Ok!')
    await ctx.reply('Agora me diga qual é o seu nome completo?');
    ctx.scene.enter('name');
})

wizard.action('boleto', async (ctx) => {
    await ctx.answerCbQuery();
    CacheService.saveUserData(ctx, 'forma_de_pagamento', 'boleto');
    await ctx.reply('Ok!');
    await ctx.reply('Agora me diga qual é o seu nome completo?');
    ctx.scene.enter('name');
})

// wizard.use(async (ctx) => {
//     if (cartao(ctx)) {
//         if (!ctx.message) {
//             await ctx.answerCbQuery()
//         }
//         await ctx.reply('Certo!')
//         await ctx.reply(mensagem.pedir_nome_completo)
//         log('Forma de pagamento definida')
//         return ctx.wizard.selectStep(3)
//     }
//     if (boleto(ctx)) {
//         if (!ctx.message) {
//             await ctx.answerCbQuery()
//         }
//         await ctx.reply('Certo!')
//         CacheService.save('forma_de_pagamento', 'boleto');
//         await ctx.reply(mensagem.pedir_nome_completo)
//         log('Forma de pagamento definida')
//         return ctx.wizard.selectStep(3)
//     }
//     awai

export default wizard;