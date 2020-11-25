import { Extra } from 'telegraf';
import { log } from '../logger';
import { silver, gold, diamond, blackDiamond, basic, premium, vip } from '../services/validate';
import { Planos, PlanosEduzz } from '../model/Planos';
import Scene from '../model/Scene';
import Keyboard from '../model/Keyboard';
import { closestIndexTo } from 'date-fns';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const planoScene = new Scene('plano')

planoScene.enter(async ctx => {
    await askForPlano(ctx);
})

const askForPlano = async (ctx) => {
    try {
        await ctx.reply('Certo!');
        await ctx.reply('Vou precisar de mais alguns dados pra confirmar o pagamento no servidor da Eduzz, tudo bem?');
    } catch (err) {
        log(`ERRO AO ENVIAR MENSAGEM ${err}`)
    }
    await showPlanoOptions(ctx);
}

const showPlanoOptions = async (ctx) => {
    log(`Enviando opções de PLANO para ${ctx.chat.id}`)
    try {
        await ctx.reply("Qual foi o plano que você contratou?", Extra.markup(Keyboard.PLANOS_OPTIONS_EDUZZ))
    } catch (err) {
        log(`ERRO AO ENVIAR MENSAGEM DE PEDIDO DE PLANO ${err}`)
    }
}

planoScene.onAction(PlanosEduzz.BASIC, async (ctx) => {
    await savePlano(PlanosEduzz.BASIC, ctx);
    await ctx.scene.enter('name', ctx.scene.session.state);
})

planoScene.onAction(PlanosEduzz.PREMIUM, async (ctx) => {
    await savePlano(PlanosEduzz.PREMIUM, ctx);
    await ctx.scene.enter('name', ctx.scene.session.state);
})

planoScene.onAction(PlanosEduzz.VIP, async (ctx) => {
    await savePlano(PlanosEduzz.VIP, ctx);
    await ctx.scene.enter('name', ctx.scene.session.state);
})

planoScene.use(async (ctx) => {
    if (basic(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(PlanosEduzz.BASIC, ctx);
        return await ctx.scene.enter('name', ctx.scene.session.state);
    }
    if (premium(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(PlanosEduzz.PREMIUM, ctx);
        return await ctx.scene.enter('name', ctx.scene.session.state);
    }
    if (vip(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(PlanosEduzz.VIP, ctx);
        return await ctx.scene.enter('name', ctx.scene.session.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePlano = async (plano, ctx: SceneContextMessageUpdate) => {
    ctx.scene.session.state = {...ctx.scene.session.state, plano}
    log(`Plano definido ${plano}`);
}

export default planoScene;
