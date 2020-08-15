import { BaseScene, Markup, Extra } from 'telegraf';

const welcomeScene = new BaseScene('welcome')

welcomeScene.enter(async (ctx) => {
    await welcome(ctx);
    await showPaymentOptions(ctx);
    await ctx.scene.enter('payment')
})

const welcome = async (ctx) => {
    await ctx.reply('Olá, eu sou o Bot do Método Trader Infalível 🤖💵 Estou aqui para te dar acesso aos nossos canais de Telegram para que você possa começar a trilhar seu caminho rumo à riqueza!');
    await ctx.reply('Preciso primeiramente confirmar no servidor da Monetizze se o seu pagamento já foi aprovado.\n\nPor isso, gostaria de saber algumas informações de você...');
}

const showPaymentOptions = async (ctx) => {
    const pagamento = Markup.inlineKeyboard([
        [Markup.callbackButton('💳 Cartão de Crédito', 'cartao_de_credito')],
        [Markup.callbackButton('📄 Boleto', 'boleto')]
    ])
    await ctx.reply("Qual foi sua forma de pagamento?", Extra.markup(pagamento))
}

export default welcomeScene;