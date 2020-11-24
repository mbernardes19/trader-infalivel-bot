import App, { Request, Response, Express } from "express";
import { Telegraf, Stage, session, Extra, Markup } from 'telegraf';
import MainStage from './stages/MainStage';
import dotEnv from 'dotenv';
import { log, logError } from './logger';
import {getUserByTelegramId, updateViewChats} from './dao';
import CacheService from "./services/cache";
import path from 'path';
dotEnv.config({path: path.join(__dirname, '..', '.env')});
import { startChatLinkValidation } from './services/chatInviteLink';
import { connection } from "./db";
import { getChats } from './services/chatResolver';
import { getChatInviteLink } from './services/chatInviteLink';
import User from "./model/User";
import { startCronJobs } from './services/cronjobs';
import { getMonetizzeProductTransaction } from './services/request'
import Keyboard from "./model/Keyboard";

const botToken = process.env.NODE_ENV === 'production' ? process.env.BOT_TOKEN : process.env.TEST_BOT_TOKEN;
const bot = new Telegraf(botToken);

CacheService.save('telegramClient', bot.telegram);

startChatLinkValidation();
startCronJobs();

bot.use(session())
bot.use(MainStage.middleware())
bot.command('start', Stage.enter('welcome'))
bot.command('reiniciar', Stage.enter('welcome'))
bot.command('canais', async ctx => {
    log(`Usuário ${ctx.chat.id} solicitou ver os canais disponíveis`);
    try {
        const dbUserResult = await getUserByTelegramId(ctx.chat.id, connection);
        if (!dbUserResult) {
            return await ctx.reply('Você ainda não ativou sua assinatura Monetizze comigo.');
        }
        if (dbUserResult.ver_canais >= 2) {
            return await ctx.reply('Você já visualizou os canais 2 vezes!');
        }
        const user = User.fromDatabaseResult(dbUserResult);
        if (user.getUserData().statusAssinatura !== 'ativa') {
            return await ctx.reply('Você já ativou sua assinatura Monetizze comigo, porém seu status de assinatura na Monetizze não está como ativo, regularize sua situação com a Monetizze para ter acesso aos canais.');
        }
        const { plano } = user.getUserData()
        const chats = await getChats(plano);
        const inviteLinks = chats.map(chat => getChatInviteLink(chat));
        const teclado = Markup.inlineKeyboard(inviteLinks.map(link => Markup.urlButton(link.chatName, link.invite)));
        await ctx.reply('É pra já!', Extra.markup(teclado))
        await updateViewChats(ctx.chat.id, connection);
    } catch (err) {
        logError(`ERRO AO ENVIAR CANAIS DISPONÍVEIS POR COMANDO PARA USUÁRIO ${ctx.chat.id}`, err)
        await ctx.reply('Ocorreu um erro ao verificar sua assinatura Monetizze. Tente novamente mais tarde.')
    }
});

(async () => {
    // const eduzz = new EduzzService();
    // const authCredentials: EduzzAuthCredentials = {email: 'grupocollab@gmail.com', publicKey: '33634949', apiKey: '4366B150AE'}
    // await eduzz.authenticate(authCredentials);
    // const res = await eduzz.getPurchases()
    // res.data.map(s => console.log(s.client_email, s.content_id, s.content_title, s.sale_status, s.sale_status_name))
    // const res2 = await eduzz.getPurchases({page: 2})
    // res2.data.map(s => console.log(s.client_email, s.content_id, s.content_title, s.sale_status, s.sale_status_name))
    // const res3 = await eduzz.getPurchases({page: 3})
    // res3.data.map(s => console.log(s.client_email, s.content_id, s.content_title, s.sale_status, s.sale_status_name))
    // const res4 = await eduzz.getPurchases({page: 4})
    // res4.data.map(s => console.log(s.content_id, s.content_title))
    // const res5 = await eduzz.getPurchases({page: 5})
    // res5.data.map(s => console.log(s.content_id, s.content_title))
    // const res6 = await eduzz.getPurchases({page: 6})
    // res6.data.map(s => console.log(s.content_id, s.content_title))
    // const res7 = await eduzz.getPurchases({page: 7})
    // res7.data.map(s => console.log(s.content_id, s.content_title))
    // const res8 = await eduzz.getPurchases({page: 8})
    // res8.data.map(s => console.log(s.content_id, s.content_title))
    // const res9 = await eduzz.getPurchases({page: 9})
    // res9.data.map(s => console.log(s.content_id, s.content_title))
})()

bot.command('t35t3', async ctx => {
    // const resp = await getMonetizzeProductTransaction({email: 'bonfin173@gmail.com'})
    const resp = await getMonetizzeProductTransaction({email: 'bonfim173@gmail.com'})
    // resp.dados.map(dado => console.log(dado))
    console.log(resp)
})

bot.command('suporte', async (ctx) => {
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(Keyboard.SUPPORT))
});

bot.on('message', async ctx => {
    if (ctx.chat.id === parseInt(process.env.ID_GRUPO_BLACK_DIAMOND, 10) || ctx.chat.id === parseInt(process.env.ID_GRUPO_PREMIUM, 10)) {
        return;
    }
    try {
        await ctx.reply('Olá, sou o Bot do Método Trader Infalível 🤖💵!\nSegue abaixo meus comandos:\n\n/start - Começar nossa conversa\n/parar - Parar nossa conversa\n/reiniciar - Começar nossa conversa do zero\n/suporte - Entrar em contato com nosso suporte')
    } catch (err) {
        log(`ERRO AO ENVIAR MENSAGEM DE BOAS VINDAS ${err}`)
    }
})
bot.launch()

const app: Express = App();

app.get('/', (req: Request, res: Response) => {
    res.send('Olá!');
});
const PORT = process.env.PORT_TRADER_INFALIVEL_BOT_DIST_MAIN || process.env.PORT_MAIN || 4000
console.log('PORTA', PORT)
app.listen(PORT, () => log('conectado na porta 3000'))