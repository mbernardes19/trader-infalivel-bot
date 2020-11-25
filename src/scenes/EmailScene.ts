import { Extra } from 'telegraf';
import { log } from '../logger';
import { confirmado, negado, validate } from '../services/validate';
import Scene from '../model/Scene';
import Keyboard from '../model/Keyboard';
import { closestIndexTo } from 'date-fns';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const emailScene = new Scene('email');

emailScene.onEnter(async (ctx) => {
    if (!ctx.scene.session.state['email']) {
        return await askForEmail(ctx);
    }
    await askForEmailAgain(ctx);
});

const askForEmail = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Agora eu só preciso que me mande o seu email. Tem que ser o mesmo email com o qual você fez a compra na Monetizze, para que eu possa te achar no sistema.\n\nTenha certeza de estar mandando o email certo!');
}

const askForEmailAgain = async (ctx) => {
    await ctx.reply('Por favor, digite seu email novamente:')
}

emailScene.use(async (ctx) => {
    await confirmEmail(ctx);
    await saveEmail(ctx.message.text, ctx);
});

const confirmEmail = async (ctx: SceneContextMessageUpdate) => {
    await ctx.reply(`Confirmando... seu email é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(Keyboard.CONFIRMATION));
    return ctx.scene.enter('confirm_email', ctx.scene.session.state);
}

const saveEmail = async (email, ctx: SceneContextMessageUpdate) => {
    ctx.scene.session.state = {...ctx.scene.session.state, email: email.toLowerCase()};
    log(`Email definido ${email}`);
}

const confirmEmailScene = new Scene('confirm_email');

confirmEmailScene.onAction('sim', async (ctx) => {
    const email = ctx.scene.session.state['email'];
    const validation = validate('email', email);
    if (validation.temErro) {
        await ctx.reply(validation.mensagemDeErro);
        return ctx.scene.enter('email', ctx.scene.session.state);
    }
    await ctx.reply(`Beleza!`);
    return ctx.scene.enter('analysis', ctx.scene.session.state);
});

confirmEmailScene.onAction('nao', async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
    return ctx.scene.enter('email', ctx.scene.session.state);
});

confirmEmailScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const email = ctx.scene.session.state['email']
        const validation = validate('email', email);
        if (validation.temErro) {
            await ctx.reply(validation.mensagemDeErro);
            return ctx.scene.enter('email', ctx.scene.session.state);
        }
        await ctx.reply(`Beleza!`);
        return ctx.scene.enter('analysis', ctx.scene.session.state);
    }
    if (negado(ctx)) {
        return ctx.scene.enter('email', ctx.scene.session.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { emailScene, confirmEmailScene };
