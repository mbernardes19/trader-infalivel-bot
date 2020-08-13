import App, { Request, Response, Express } from "express";
import { Telegraf, Stage, session } from 'telegraf';
import MainStage from './stages/MainStage';
import dotEnv from 'dotenv';
import { log } from './logger';
dotEnv.config();

const botToken = process.env.NODE_ENV === 'production' ? process.env.BOT_TOKEN : process.env.TEST_BOT_TOKEN;
const bot = new Telegraf(botToken);

// INFOS
// id telegram
// código de cupom de desconto
// código de plano
// nome de usuario
// nome completo (pedir)
// telefone com DDD (pedir)
// email
// forma de pagamento (pedir)
// qual plano comprado (pedir)

bot.use(session())
bot.use(MainStage.middleware())
bot.command('start', Stage.enter('welcome'))
bot.on('message', ctx => {
    ctx.reply('respondendo')
})
bot.launch()

const app: Express = App();

app.get('/', (req: Request, res: Response) => {
    res.send('Olá!');
});

app.listen(3000, () => console.log('conectado na porta 3000'))
log('iniciou').info()