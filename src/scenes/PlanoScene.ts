import { Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { silver, gold, diamond, blackDiamond } from '../services/validate';
import { Planos } from '../model/Planos';
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
        await ctx.reply("Qual foi o plano que você contratou?", Extra.markup(Keyboard.PLANOS_OPTIONS))
    } catch (err) {
        log(`ERRO AO ENVIAR MENSAGEM DE PEDIDO DE PLANO ${err}`)
    }
}

planoScene.onAction(Planos.SILVER, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.SILVER);
    await ctx.scene.enter('name');
})

planoScene.onAction(Planos.GOLD, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.GOLD);
    await ctx.scene.enter('name');
})

planoScene.onAction(Planos.DIAMOND, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.DIAMOND);
    await ctx.scene.enter('name');
})

planoScene.onAction(Planos.BLACK_DIAMOND, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.BLACK_DIAMOND);
    await ctx.scene.enter('name');
})

planoScene.use(async (ctx) => {
    if (silver(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.SILVER);
        return await ctx.scene.enter('name');
    }
    if (gold(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.GOLD);
        return await ctx.scene.enter('name');
    }
    if (diamond(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.DIAMOND);
        return await ctx.scene.enter('name');
    }
    if (blackDiamond(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.BLACK_DIAMOND);
        return await ctx.scene.enter('name');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePlano = async (plano) => {
    CacheService.savePlano(plano);
    log(`Plano definido ${plano}`);
}

export default planoScene;
