import App, { Request, Response, Express } from "express";
import { Telegraf, Stage, session } from 'telegraf';
import MainStage from './stages/MainStage';
import dotEnv from 'dotenv';
import { log } from './logger';
import CacheService from "./services/cache";
import path from 'path';
dotEnv.config({path: path.join(__dirname, '..', '.env')});

const botToken = process.env.NODE_ENV === 'production' ? process.env.BOT_TOKEN : process.env.TEST_BOT_TOKEN;
const bot = new Telegraf(botToken);

CacheService.save('telegramClient', bot.telegram);

bot.use(session())
bot.use(MainStage.middleware())
bot.command('start', Stage.enter('welcome'))
bot.command('reiniciar', Stage.enter('welcome'))

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