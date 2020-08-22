import App, { Request, Response, Express } from "express";
import { Telegraf, Stage, session, Extra, Markup } from 'telegraf';
import MainStage from './stages/MainStage';
import dotEnv from 'dotenv';
import { log } from './logger';
import {getUserByTelegramId} from './dao';
import CacheService from "./services/cache";
import path from 'path';
dotEnv.config({path: path.join(__dirname, '..', '.env')});
import { startChatLinkValidation } from './services/chatInviteLink';
import { connection } from "./db";
import { getChat } from './services/chatResolver';
import { getChatInviteLink } from './services/chatInviteLink';
import User from "./model/User";
import { startCronJobs } from './services/cronjobs';

const botToken = process.env.NODE_ENV === 'production' ? process.env.BOT_TOKEN : process.env.TEST_BOT_TOKEN;
const bot = new Telegraf(botToken);

CacheService.save('telegramClient', bot.telegram);

startChatLinkValidation();
startCronJobs();

bot.use(session())
bot.use(MainStage.middleware())
bot.on('new_chat_members', (ctx) => console.log(ctx.message.new_chat_members))
bot.command('start', Stage.enter('welcome'))
bot.command('reiniciar', Stage.enter('welcome'))
bot.command('canais', async ctx => {
    try {
        const dbUserResult = await getUserByTelegramId(ctx.chat.id, connection);
        if (!dbUserResult) {
            return await ctx.reply('Você ainda não ativou sua assinatura Monetizze comigo.');
        }
        const user = User.fromDatabaseResult(dbUserResult);
        if (user.getUserData().statusAssinatura !== 'ativa') {
            return await ctx.reply('Você já ativou sua assinatura Monetizze comigo, porém seu status de assinatura na Monetizze não está como ativo, regularize sua situação com a Monetizze para ter acesso aos canais.');
        }
        const { plano, dataAssinatura } = user.getUserData()
        const [chatName, chatId] = await getChat(plano, dataAssinatura);
        const specificChatInviteLink = getChatInviteLink(chatId);
        const generalChatInviteLink = getChatInviteLink(process.env.ID_CANAL_GERAL);
        const teclado = Markup.inlineKeyboard([
            Markup.urlButton('Canal Geral', generalChatInviteLink),
            Markup.urlButton(chatName, specificChatInviteLink)
        ]);
        await ctx.reply('É pra já!', Extra.markup(teclado))
    } catch (err) {
        log(err)
        await ctx.reply('Ocorreu um erro ao verificar sua assinatura Monetizze. Tente novamente mais tarde.')
    }
});

bot.on('message', async ctx => {
    if (ctx.chat.id === parseInt(process.env.ID_GRUPO_BLACK_DIAMOND, 10)) {
        return;
    }
    ctx.reply('Olá, sou o Bot do Método Trader Infalível 🤖💵!\nSegue abaixo meus comandos:\n\n/start - Começar nossa conversa\n/parar - Parar nossa conversa\n/reiniciar - Começar nossa conversa do zero')
})
bot.launch()

const app: Express = App();

app.get('/', (req: Request, res: Response) => {
    res.send('Olá!');
});

const PORT = process.env.PORT_TRADER_INFALIVEL_BOT_DIST_MAIN || process.env.PORT_MAIN || 3000
app.listen(PORT, () => log('conectado na porta 3000'))