import { Extra } from 'telegraf';
import { log } from '../logger';
import { confirmado, negado } from '../services/validate';
import Scene from '../model/Scene';
import Keyboard from '../model/Keyboard';
import { closestIndexTo } from 'date-fns';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const nameScene = new Scene('name');

nameScene.onEnter(async (ctx) => {
    if (!ctx.scene.session.state['fullName']) {
        return await askForFullName(ctx);
    }
    await askForFullNameAgain(ctx);
})

nameScene.use(async (ctx) => {
    await confirmFullName(ctx);
    await saveFullName(ctx.message.text, ctx);
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
    return ctx.scene.enter('confirm_name', ctx.scene.session.state);
}

const saveFullName = async (fullName, ctx: SceneContextMessageUpdate) => {
    log('salvou o nome')
    ctx.scene.session.state = {...ctx.scene.session.state, fullName}
    log(`Nome completo definido ${fullName}`);
}

const confirmNameScene = new Scene('confirm_name');

confirmNameScene.onAction('sim', async (ctx) => {
    const nome = ctx.scene.session.state['fullName']
    await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
    return ctx.scene.enter('phone', ctx.scene.session.state);
});

confirmNameScene.onAction('nao', async (ctx) => {
    return ctx.scene.enter('name', ctx.scene.session.state);
});

confirmNameScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const nome = ctx.scene.session.state['fullName'];
        await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
        return ctx.scene.enter('phone', ctx.scene.session.state);
    }
    if (negado(ctx)) {
        return ctx.scene.enter('name', ctx.scene.session.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { nameScene, confirmNameScene };
