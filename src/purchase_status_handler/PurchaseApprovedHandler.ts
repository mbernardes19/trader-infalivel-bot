import AbstractPurchaseStatusHandler from "./AbstractPurchaseStatusHandler"
import { PurchaseStatus } from "../model/PurchaseStatus";
import { log, logError, enviarMensagemDeErroAoAdmin } from '../logger';
import { addUserToDatabase } from '../dao';
import { connection } from '../db';
import User from '../model/User';
import UserData from '../model/UserData';
import CacheService from '../services/cache';
import { getDiscountCouponIdFromUser, getDataAssinaturaFromUser } from '../services/monetizze';
import { Telegram, Markup, Extra, Context } from 'telegraf';
import { pegarDiasSobrandoDeAssinatura } from '../services/diasAssinatura';
import { getChats } from '../services/chatResolver';
import { getChatInviteLink } from '../services/chatInviteLink';
import EduzzService from "../services/eduzz";

const getUserDiscountCoupon = async () => {
    const email = CacheService.getEmail();
    const plano = CacheService.getPlano();
    try {
        return await getDiscountCouponIdFromUser(email, plano)
    } catch (err) {
        throw err;
    }
}

const getUserDataAssinatura = async () => {
    const email = CacheService.getEmail();
    try {
        const eduzzService = new EduzzService();
        await eduzzService.authenticate({email: 'grupocollab@gmail.com', publicKey: '33634949', apiKey: '4366B150AE'})
        return await eduzzService.getUserSubscriptionDate(email);
    } catch (err) {
        throw err;
    }
}

const getUserData = async (ctx): Promise<UserData> => {
    log(`Pegando dados de usuário ${ctx.chat.id}`);
    try {
        const userData: UserData = new UserData();
        const telegramClient = CacheService.get<Telegram>('telegramClient');
        const chat = await telegramClient.getChat(ctx.chat.id)
        userData.telegramId = ctx.chat.id.toString();
        userData.discountCouponId = '0';
        userData.username = chat.username;
        userData.paymentMethod = CacheService.getPaymentMethod();
        userData.plano = CacheService.getPlano();
        userData.fullName = CacheService.getFullName();
        userData.phone = CacheService.getPhone();
        userData.email = CacheService.getEmail();
        userData.dataAssinatura = await getUserDataAssinatura();
        userData.diasAteFimDaAssinatura = 0
        // await pegarDiasSobrandoDeAssinatura(CacheService.getPlano(), CacheService.getEmail())

        log(`Username Telegram definido ${userData.username}`)
        log(`Id Telegram definido ${userData.telegramId}`)
        log(`Cupom de desconto definido ${userData.discountCouponId}`)
        log(`Data de assinatura definida ${userData.dataAssinatura}`)

        return userData;
    } catch (err) {
        logError(`ERRO AO PEGAR DADOS DE USUÁRIO ${ctx.chat.id}`, err);
        await enviarMensagemDeErroAoAdmin(`ERRO AO PEGAR DADOS DE USUÁRIO ${ctx.chat.id}`, err);

    }
}

const enviarCanaisDeTelegram = async (ctx: Context, plano: string, dataAssinatura: string) => {
    let chats = []
    let inviteLinks = [];
    log(`Enviando canais de Telegram para usuário ${ctx.chat.id}`)
    try {
        chats = await getChats(plano);
        inviteLinks = chats.map(chat => getChatInviteLink(chat));
    } catch (err) {
        logError(`ERRO AO ENVIAR CANAIS DE TELEGRAM`, err)
        await enviarMensagemDeErroAoAdmin(`ERRO AO ENVIAR CANAIS DE TELEGRAM`, err);
        throw err;
    }

    log(`Canal (${plano}) enviado para ${ctx.chat.id}`)

    const teclado = Markup.inlineKeyboard(inviteLinks.map(link => Markup.urlButton(link.chatName, link.invite)));
    await ctx.reply('Seja bem-vindo(a)!')
    await ctx.reply('Clique agora nos dois botões e acesse nossos canais o quanto antes, logo esses botões vão expirar ⤵️', Extra.markup(teclado))
    return await ctx.replyWithMarkdown('Caso eles já tenham expirado quando você clicar, utilize o comando /canais para recebê-los atualizados!\n\n*OBS.: Você só pode receber os canais por esse comando 2 vezes.*');
}

const saveUser = async (newUser: User) => {
    try {
        log(`Adicionando usuário ${newUser.getUserData().telegramId} ao banco de dados`)
        await addUserToDatabase(newUser, connection)
    } catch (err) {
        logError(`ERRO AO SALVAR USUÁRIO NO BANCO DE DADOS ${newUser.getUserData().telegramId}`, err)
        await enviarMensagemDeErroAoAdmin(`ERRO AO SALVAR USUÁRIO NO BANCO DE DADOS ${newUser.getUserData().telegramId}`, err);
        throw err;
    }
}

const endConversation = async (ctx) => {
    log(`Conversa com ${ctx.chat.id} finalizada`)
    CacheService.clearAllUserData();
    return ctx.scene.leave();
}

export default class PurchaseApprovedHandler extends AbstractPurchaseStatusHandler {

    async handle(purchaseStatus: PurchaseStatus) {
        if (purchaseStatus === PurchaseStatus.PURCHASE_APPROVED) {
            log(`Compra e plano de ${this._ctx.chat.id} foram confirmados!`);
            try {
                const userData = await getUserData(this._ctx);
                const newUser = new User(userData);
                await saveUser(newUser);
                await enviarCanaisDeTelegram(this._ctx, userData.plano, userData.dataAssinatura);
                await endConversation(this._ctx);
            } catch (err) {
                if (err.errno === 1062) {
                    logError(`Usuário já existe no banco de dados`, err);
                    await enviarMensagemDeErroAoAdmin(`Usuário já existe no banco de dados`, err);
                    await this._ctx.reply(`Você já ativou sua assinatura Monettize comigo antes.`)
                    return await endConversation(this._ctx);
                } else {
                    await this._ctx.reply(`Sua compra na Monetizze foi confirmada, porém ocorreu um erro ao ativar sua assinatura na Monetizze.`)
                    return await endConversation(this._ctx);
                }
            }
        } else {
            super.handle(purchaseStatus)
        }
    }
}