import { Extra } from 'telegraf';
import { log } from '../logger';
import { cartao, boleto } from '../services/validate';
import Scene from '../model/Scene';
import Keyboard from '../model/Keyboard';
import { closestIndexTo } from 'date-fns';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const paymentScene = new Scene('payment')

paymentScene.onEnter(async ctx => {
    await showPaymentOptions(ctx);
})

const showPaymentOptions = async (ctx) => {
    log(`Enviando opções de PAGAMENTO para ${ctx.chat.id}`)
    try {
        await ctx.reply("Qual foi sua forma de pagamento?", Extra.markup(Keyboard.PAYMENT_OPTIONS))
    } catch (err) {
        log(`ERRO AO ENVIAR MENSAGEM DE PEDIDO DE PAGAMENTO ${err}`)
    }
}

paymentScene.onAction('cartao_de_credito', async (ctx) => {
    await savePaymentMethod('cartao_de_credito', ctx);
    await ctx.scene.enter('plano', ctx.scene.session.state);
})

paymentScene.onAction('boleto', async (ctx) => {
    await savePaymentMethod('boleto', ctx);
    await ctx.scene.enter('plano', ctx.scene.session.state);
})

paymentScene.use(async (ctx) => {
    if (cartao(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePaymentMethod('cartao_de_credito', ctx);
        return await ctx.scene.enter('plano', ctx.scene.session.state);
    }
    if (boleto(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePaymentMethod('boleto', ctx);
        return await ctx.scene.enter('plano', ctx.scene.session.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePaymentMethod = async (paymentMethod, ctx: SceneContextMessageUpdate) => {
    ctx.scene.session.state = {...ctx.scene.session.state, paymentMethod}
    log(`Forma de pagamento definida ${paymentMethod}`);
}

export default paymentScene;
