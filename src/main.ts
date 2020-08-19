import App, { Request, Response, Express } from "express";
import { Telegraf, Stage, session } from 'telegraf';
import MainStage from './stages/MainStage';
import dotEnv from 'dotenv';
import { log } from './logger';
import { getMonetizzeProductTransaction } from './services/request'
import CacheService from "./services/cache";
import { isBefore } from "date-fns";
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
bot.command('reiniciar', Stage.enter('welcome'))

bot.on('message', async ctx => {
    const res = await getMonetizzeProductTransaction({email: 'rafael.touringcar@gmail.com'})
    res.dados.map(dado => console.log(dado.comprador.email, dado.venda.dataInicio, dado.plano, dado.assinatura.data_assinatura));
    ctx.reply('Olá, sou o Bot do Método Trader Infalível 🤖💵!\nSegue abaixo meus comandos:\n\n/start - Começar nossa conversa\n/reiniciar - Começar nossa conversa do zero novamente')
})
bot.launch()

const app: Express = App();

app.get('/', (req: Request, res: Response) => {
    res.send('Olá!');
});

const PORT = process.env.PORT_TRADER_INFALIVEL_BOT_DIST_MAIN || process.env.PORT_MAIN || 3000
app.listen(PORT, () => log('conectado na porta 3000'))