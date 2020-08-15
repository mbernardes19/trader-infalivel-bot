import { BaseScene, Extra, Markup } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { confirmado, negado } from '../services/validate';

const phoneScene = new BaseScene('name');

phoneScene.use(async (ctx) => {
    await confirmPhone(ctx);
    await saveFullName(ctx.message.text);
});

const confirmPhone = async (ctx) => {
    const confirmacao = Markup.inlineKeyboard([Markup.callbackButton('👍 Sim', 'sim'), Markup.callbackButton('👎 Não', 'nao')])
    await ctx.reply(`Confirmando... seu nome completo é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(confirmacao));
    return ctx.scene.enter('confirm_name');
}

const saveFullName = async (fullname) => {
    CacheService.saveUserData('nome_completo', fullname);
    log(`Nome completo definido ${fullname}`);
}

const confirmPhoneScene = new BaseScene('confirm_name');

confirmPhoneScene.action('sim', async (ctx) => {
    const nome = CacheService.get<string>('nome_completo');
    await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
    return ctx.scene.enter('phone');
});

confirmPhoneScene.action('nao', async (ctx) => {
    await ctx.reply('Por favor, digite seu nome completo novamente:')
    return ctx.scene.enter('name');
});

confirmPhoneScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const nome = CacheService.get<string>('nome_completo');
        await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
        return ctx.scene.enter('phone');
    }
    if (negado(ctx)) {
        await ctx.reply('Por favor, digite seu nome completo novamente:')
        return ctx.scene.enter('name');
    }
});

export { phoneScene, confirmPhoneScene };
