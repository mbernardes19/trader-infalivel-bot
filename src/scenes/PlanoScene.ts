import { BaseScene, Markup, Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { silver, gold, diamond, blackDiamond } from '../services/validate';

const planoScene = new BaseScene('plano')

planoScene.action('silver', async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano('silver');
    await askForFullName(ctx)
    await ctx.scene.enter('name');
})

planoScene.action('gold', async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano('gold');
    await askForFullName(ctx)
    await ctx.scene.enter('name');
})

planoScene.action('diamond', async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano('diamond');
    await askForFullName(ctx)
    await ctx.scene.enter('name');
})

planoScene.action('black_diamond', async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano('black_diamond');
    await askForFullName(ctx)
    await ctx.scene.enter('name');
})

planoScene.use(async (ctx) => {
    if (silver(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano('silver');
        await askForFullName(ctx);
        await ctx.scene.enter('name');
    }
    if (gold(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano('gold');
        await askForFullName(ctx);
        await ctx.scene.enter('name');
    }
    if (diamond(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano('diamond');
        await askForFullName(ctx);
        await ctx.scene.enter('name');
    }
    if (blackDiamond(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano('black_diamond');
        await askForFullName(ctx);
        await ctx.scene.enter('name');
    }
});

const savePlano = async (plano) => {
    CacheService.saveUserData('plano', plano);
    log(`Plano definido ${plano}`);
}

const askForFullName = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Qual é o seu nome completo?');
}

export default planoScene;
