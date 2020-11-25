import { Extra } from 'telegraf';
import { log } from '../logger';
import { confirmado, negado, validate } from '../services/validate';
import Scene from '../model/Scene';
import Keyboard from '../model/Keyboard';
import { closestIndexTo } from 'date-fns';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const phoneScene = new Scene('phone');

phoneScene.onEnter(async (ctx) => {
    if (!ctx.scene.session.state['phone']) {
        return await askForPhone(ctx);
    }
    await askForPhoneAgain(ctx);
});

const askForPhone = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Qual é o seu telefone com DDD?');
}

const askForPhoneAgain = async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
}

phoneScene.use(async (ctx) => {
    await confirmPhone(ctx);
    await savePhoneNumber(ctx.message.text.replace(/ /g, ""), ctx);
});

const confirmPhone = async (ctx) => {
    await ctx.reply(`Confirmando... seu telefone é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(Keyboard.CONFIRMATION));
    return ctx.scene.enter('confirm_phone', ctx.scene.session.state);
}

const savePhoneNumber = async (phone, ctx: SceneContextMessageUpdate) => {
    ctx.scene.session.state = {...ctx.scene.session.state, phone}
    log(`Número de telefone definido ${phone}`);
}

const confirmPhoneScene = new Scene('confirm_phone');

confirmPhoneScene.onAction('sim', async (ctx) => {
    const telefone = ctx.scene.session.state['phone'];
    const validation = validate('telefone', telefone);
    if (validation.temErro) {
        await ctx.reply(validation.mensagemDeErro);
        return ctx.scene.enter('phone', ctx.scene.session.state);
    }
    await ctx.reply(`Beleza!`);
    return ctx.scene.enter('email', ctx.scene.session.state);
});

confirmPhoneScene.onAction('nao', async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
    return ctx.scene.enter('phone', ctx.scene.session.state);
});

confirmPhoneScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const telefone = ctx.scene.session.state['phone'];
        const validation = validate('telefone', telefone);
        if (validation.temErro) {
            await ctx.reply(validation.mensagemDeErro);
            return ctx.scene.enter('phone', ctx.scene.session.state);
        }
        await ctx.reply(`Beleza!`);
        return ctx.scene.enter('email', ctx.scene.session.state);
    }
    if (negado(ctx)) {
        return ctx.scene.enter('phone', ctx.scene.session.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { phoneScene, confirmPhoneScene };
