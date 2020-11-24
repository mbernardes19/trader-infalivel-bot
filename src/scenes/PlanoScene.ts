import { Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { silver, gold, diamond, blackDiamond, basic, premium, vip } from '../services/validate';
import { Planos, PlanosEduzz } from '../model/Planos';
import Scene from '../model/Scene';
import Keyboard from '../model/Keyboard';

const planoScene = new Scene('plano')

planoScene.enter(async ctx => {
    await askForPlano(ctx);
})

const askForPlano = async (ctx) => {
    try {
        await ctx.reply('Certo!');
        await ctx.reply('Vou precisar de mais alguns dados pra confirmar o pagamento no servidor da Monetizze, tudo bem?');
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
    await savePlano(PlanosEduzz.BASIC);
    await ctx.scene.enter('name');
})

planoScene.onAction(PlanosEduzz.PREMIUM, async (ctx) => {
    await savePlano(PlanosEduzz.PREMIUM);
    await ctx.scene.enter('name');
})

planoScene.onAction(PlanosEduzz.VIP, async (ctx) => {
    await savePlano(PlanosEduzz.VIP);
    await ctx.scene.enter('name');
})

planoScene.use(async (ctx) => {
    if (basic(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(PlanosEduzz.BASIC);
        return await ctx.scene.enter('name');
    }
    if (premium(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(PlanosEduzz.PREMIUM);
        return await ctx.scene.enter('name');
    }
    if (vip(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(PlanosEduzz.VIP);
        return await ctx.scene.enter('name');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePlano = async (plano) => {
    CacheService.savePlano(plano);
    log(`Plano definido ${plano}`);
}

export default planoScene;
