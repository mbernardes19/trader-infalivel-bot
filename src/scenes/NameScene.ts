import { Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { confirmado, negado } from '../services/validate';
import Scene from '../model/Scene';
import Keyboard from '../model/Keyboard';

const nameScene = new Scene('name');

nameScene.onEnter(async (ctx) => {
    if (!CacheService.getFullName()) {
        return await askForFullName(ctx);
    }
    await askForFullNameAgain(ctx);
})

nameScene.use(async (ctx) => {
    await confirmFullName(ctx);
    await saveFullName(ctx.message.text);
});

const askForFullName = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Qual é o seu nome completo?');
}

const askForFullNameAgain = async (ctx) => {
    await ctx.reply('Por favor, digite seu nome completo novamente:')
}

const confirmFullName = async (ctx) => {
    await ctx.reply(`Confirmando... seu nome completo é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(Keyboard.CONFIRMATION));
    return ctx.scene.enter('confirm_name');
}

const saveFullName = async (fullname) => {
    log('salvou o nome')
    CacheService.saveFullName(fullname);
    log(`Nome completo definido ${fullname}`);
}

const confirmNameScene = new Scene('confirm_name');

confirmNameScene.onAction('sim', async (ctx) => {
    const nome = CacheService.getFullName();
    await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
    return ctx.scene.enter('phone');
});

confirmNameScene.onAction('nao', async (ctx) => {
    return ctx.scene.enter('name');
});

confirmNameScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const nome = CacheService.getFullName();
        await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
        return ctx.scene.enter('phone');
    }
    if (negado(ctx)) {
        return ctx.scene.enter('name');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { nameScene, confirmNameScene };
