import { log } from '../logger';
import Scene from '../model/Scene';

const welcomeScene = new Scene('welcome')

welcomeScene.onEnter(async (ctx) => {
    if (ctx.chat.id === parseInt(process.env.ID_GRUPO_BLACK_DIAMOND, 10)) {
        return await ctx.scene.leave();
    }
    await welcome(ctx);
    await ctx.scene.enter('payment', ctx.scene.session.state)
})

const welcome = async (ctx) => {
    log(`Enviando boas vindas para ${ctx.chat.id}`)
    try {
        await ctx.reply('Olá, eu sou o Bot do Método Trader Infalível 🤖💵 Estou aqui para te dar acesso aos nossos canais de Telegram para que você possa começar a trilhar seu caminho rumo à riqueza!');
        await ctx.reply('Preciso primeiramente confirmar no servidor da Monetizze se o seu pagamento já foi aprovado.\n\nPor isso, gostaria de saber algumas informações de você...');
    } catch (err) {
        log(`ERRO AO ENVIAR MENSAGEM DE BOAS VINDAS ${err}`)
    }
}

export default welcomeScene;