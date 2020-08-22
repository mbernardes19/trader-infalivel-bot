import Telegraf, { BaseScene, Context, Markup, Extra, Telegram } from 'telegraf';
import CacheService from '../services/cache';
import { getDiscountCouponIdFromUser, verifyUserPurchase, checkIfPaymentMethodIsBoleto, confirmPlano, getDataAssinaturaFromUser } from '../services/monetizze';
import UserData from '../model/UserData';
import User from '../model/User';
import { logError, log } from '../logger';
import { addUserToDatabase } from '../dao';
import { connection } from '../db';
import { getChat } from '../services/chatResolver';
import { getChatInviteLink } from '../services/chatInviteLink';

const analysisScene = new BaseScene('analysis')

analysisScene.command('reiniciar', ctx => {
    CacheService.clearAllUserData()
    return ctx.scene.enter('welcome')
})

analysisScene.command('parar', async ctx => {
    CacheService.clearAllUserData()
    return await ctx.scene.leave()
})

analysisScene.enter(async (ctx) => {
    await ctx.reply('Verificando sua compra nos servidores da Monetizze...');
    const email = CacheService.getEmail();
    let isPurchaseApproved;
    let isPlanoConfirmed;
    try {
        isPurchaseApproved = await verifyUserPurchase(email);
        if (isPurchaseApproved) {
            isPlanoConfirmed = await confirmPlano(email);
        }
    } catch (err) {
        logError(`Erro ao verificar compra de usuário na Monetizze`, err)
        await ctx.reply('Me desculpe... Ocorreu um erro ao verificar a sua compra na Monetizze. Por favor, tente iniciar uma conversa comigo novamente.');
        return await endConversation(ctx);
    }

    if (isPurchaseApproved) {
        if (!isPlanoConfirmed) {
            await ctx.reply('O plano que você selecionou não é o mesmo que consta na compra na Monetizze. Por favor comece nossa conversa novamente com /reiniciar e atribua o plano correto.');
            return await endConversation(ctx);
        }
        try {
            const userData = await getUserData(ctx);
            const newUser = new User(userData);
            await saveUser(newUser);
            await enviarCanaisDeTelegram(ctx, userData.plano, userData.dataAssinatura);
            console.log(newUser);
        } catch (err) {
            if (err.errno === 1062) {
                logError(`Usuário já existe no banco de dados`, err);
                await ctx.reply(`Você já ativou sua assinatura Monettize comigo antes.`)
                return await endConversation(ctx);
            } else {
                await ctx.reply(`Sua compra na Monetizze foi confirmada, porém ocorreu um erro ao ativar sua assinatura na Monetizze.`)
                return await endConversation(ctx);
            }
        } finally {
            await endConversation(ctx);
        }
        return;
    } else {
        let isPaymentBoleto;
        try {
            isPaymentBoleto = await checkIfPaymentMethodIsBoleto(email);
        } catch (err) {
            logError('Desculpe, ocorreu um erro ao verificar se pagamento foi feito no boleto. Tente iniciar uma conversa comigo de novo', err)
        }
        if (isPaymentBoleto) {
            if (!isPlanoConfirmed) {
                await ctx.reply('O plano que você selecionou não é o mesmo que consta na compra na Monetizze. Por favor comece nossa conversa novamente com /reiniciar e atribua o plano correto.');
                return await endConversation(ctx);
            }
            await ctx.reply('Sua compra foi iniciada, porém o seu boleto ainda não foi pago / compensado. Você pode ver o status do seu boleto acessando monetizze.com.br . Quando estiver compensado volte e inicie uma conversa comigo novamente!')
            return await endConversation(ctx);
        }
        await ctx.reply('Nenhuma compra confirmada do seu usuário foi encontrada na Monetizze ou sua assinatura não está com status ativo.\n\nSe você realmente comprou, fale agora com o suporte ⤵️\n@diego_sti\n@julianocba\n@juliasantanana')
        return await endConversation(ctx);
    }
})

const getUserDiscountCoupon = async () => {
    const email = CacheService.getEmail();
    const plano = CacheService.getPlano();
    try {
        return await getDiscountCouponIdFromUser(email, plano)
    } catch (err) {
        logError(`Erro ao pegar cupom de desconto do usuário ${email}`, err)
    }
}

const getUserDataAssinatura = async () => {
    const email = CacheService.getEmail();
    try {
        return await getDataAssinaturaFromUser(email);
    } catch (err) {
        logError(`Erro ao pegar data de assinatura do usuário ${email}`, err)
    }
}

const getUserData = async (ctx): Promise<UserData> => {
    const userData: UserData = new UserData();
    const telegramClient = CacheService.get<Telegram>('telegramClient');
    console.log('TELEGRAM CLIENT', telegramClient);
    const chat = await telegramClient.getChat(ctx.chat.id)
    console.log('CHAT', chat);
    console.log('CTX', ctx)
    userData.telegramId = ctx.chat.id.toString();
    userData.discountCouponId = await getUserDiscountCoupon();
    userData.username = chat.username;
    userData.paymentMethod = CacheService.getPaymentMethod();
    userData.plano = CacheService.getPlano();
    userData.fullName = CacheService.getFullName();
    userData.phone = CacheService.getPhone();
    userData.email = CacheService.getEmail();
    userData.dataAssinatura = await getUserDataAssinatura();

    log(`Username Telegram definido ${userData.username}`)
    log(`Id Telegram definido ${userData.telegramId}`)
    log(`Cupom de desconto definido ${userData.discountCouponId}`)
    log(`Data de assinatura definida ${userData.dataAssinatura}`)

    return userData;
}

const saveUser = async (newUser: User) => {
    try {
        await addUserToDatabase(newUser, connection)
    } catch (err) {
        logError(`ERRO AO SALVAR USUÁRIO NO BANCO DE DADOS ${newUser.getUserData().telegramId}`, err)
        throw err;
    }
}

const enviarCanaisDeTelegram = async (ctx: Context, plano: string, dataAssinatura: string) => {
    const [chatName, chatId] = await getChat(plano, dataAssinatura);
    console.log('CHAAAAT', chatName, chatId);

    const linkChatEspecifico = getChatInviteLink(chatId);
    const linkCanalGeral = getChatInviteLink(process.env.ID_CANAL_GERAL)
    console.log('GERAL', linkCanalGeral)
    console.log('ESPECIFICO', linkChatEspecifico)

    const teclado = Markup.inlineKeyboard([
        Markup.urlButton('Canal Geral', linkCanalGeral),
        Markup.urlButton(chatName, linkChatEspecifico)
    ])
    await ctx.reply('Seja bem-vindo(a)!')
    await ctx.reply('Clique agora nos dois botões e acesse nossos canais o quanto antes, logo esses botões vão expirar ⤵️', Extra.markup(teclado))
    return await ctx.replyWithMarkdown('Caso eles já tenham expirado quando você clicar, utilize o comando /canais para recebê-los atualizados!\n\n*OBS.: Você só pode receber os canais por esse comando 2 vezes.*');
}

const endConversation = async (ctx) => {
    CacheService.clearAllUserData();
    return ctx.scene.leave();
}

export default analysisScene;