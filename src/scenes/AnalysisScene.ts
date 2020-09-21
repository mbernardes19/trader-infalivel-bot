import { Context, Markup, Extra, Telegram } from 'telegraf';
import CacheService from '../services/cache';
import { getDiscountCouponIdFromUser, verifyUserPurchase, checkIfPaymentMethodIsBoleto, confirmPlano, getDataAssinaturaFromUser } from '../services/monetizze';
import UserData from '../model/UserData';
import User from '../model/User';
import { logError, log, enviarMensagemDeErroAoAdmin } from '../logger';
import { addUserToDatabase } from '../dao';
import { connection } from '../db';
import { getChat } from '../services/chatResolver';
import { getChatInviteLink } from '../services/chatInviteLink';
import { pegarDiasSobrandoDeAssinatura } from '../services/diasAssinatura';
import Scene from '../model/Scene';

const analysisScene = new Scene('analysis')

analysisScene.onEnter(async (ctx) => {
    await ctx.reply('Verificando sua compra nos servidores da Monetizze...');
    const email = CacheService.getEmail();
    let isPurchaseApproved;
    let isPlanoConfirmed;
    try {
        log(`Iniciando análise de compra ${ctx.chat.id}`)
        isPurchaseApproved = await verifyUserPurchase(email);
        if (isPurchaseApproved) {
            log(`Compra confirmada! ${ctx.chat.id}`)
            isPlanoConfirmed = await confirmPlano(email);
        }
    } catch (err) {
        logError(`Erro ao verificar compra de usuário na Monetizze`, err)
        await enviarMensagemDeErroAoAdmin(`Erro ao verificar compra de usuário na Monetizze`, err);
        await ctx.reply('Me desculpe... Ocorreu um erro ao verificar a sua compra na Monetizze. Por favor, tente iniciar uma conversa comigo novamente.');
        return await endConversation(ctx);
    }

    if (isPurchaseApproved) {
        if (!isPlanoConfirmed) {
            log(`Compra de ${ctx.chat.id} foi confirmada, mas o plano informado não é o mesmo da compra`)
            await ctx.reply('O plano que você selecionou não é o mesmo que consta na compra na Monetizze. Por favor comece nossa conversa novamente com /reiniciar e atribua o plano correto.');
            return await endConversation(ctx);
        }
        log(`Compra e plano de ${ctx.chat.id} foram confirmados!`)
        try {
            const userData = await getUserData(ctx);
            const newUser = new User(userData);
            await saveUser(newUser);
            await enviarCanaisDeTelegram(ctx, userData.plano, userData.dataAssinatura);
            await endConversation(ctx);
        } catch (err) {
            if (err.errno === 1062) {
                logError(`Usuário já existe no banco de dados`, err);
                await enviarMensagemDeErroAoAdmin(`Usuário já existe no banco de dados`, err);
                await ctx.reply(`Você já ativou sua assinatura Monettize comigo antes.`)
                return await endConversation(ctx);
            } else {
                await ctx.reply(`Sua compra na Monetizze foi confirmada, porém ocorreu um erro ao ativar sua assinatura na Monetizze.`)
                return await endConversation(ctx);
            }
        }
    } else {
        let isPaymentBoleto;
        try {
            isPaymentBoleto = await checkIfPaymentMethodIsBoleto(email);
        } catch (err) {
            logError(`ERRO AO VERIFICAR SE PAGAMENTO FOI FEITO NO BOLETO E ESTÁ AGUARDANDO PAGAMENTO`, err)
            await enviarMensagemDeErroAoAdmin(`ERRO AO VERIFICAR SE PAGAMENTO FOI FEITO NO BOLETO E ESTÁ AGUARDANDO PAGAMENTO`, err);
            await ctx.reply('Desculpe, ocorreu um erro ao verificar se pagamento foi feito no boleto. Tente iniciar uma conversa comigo novamente usando o comando /reiniciar')
        }
        if (isPaymentBoleto) {
            log(`Pagamento de ${ctx.chat.id} foi em boleto e está aguardando pagamento`)
            if (!isPlanoConfirmed) {
                log(`Plano informado por ${ctx.chat.id} não é o mesmo da compra`)
                await ctx.reply('O plano que você selecionou não é o mesmo que consta na compra na Monetizze. Por favor comece nossa conversa novamente com /reiniciar e atribua o plano correto.');
                return await endConversation(ctx);
            }
            await ctx.reply('Sua compra foi iniciada, porém o seu boleto ainda não foi pago/compensado. Você pode ver o status do seu boleto acessando monetizze.com.br . Quando estiver compensado volte e inicie uma conversa comigo novamente!')
            return await endConversation(ctx);
        }
        log(`Nenhuma compra feita pelo usuário ${ctx.chat.id} foi encontrada`)
        await ctx.reply('Nenhuma compra confirmada do seu usuário foi encontrada na Monetizze ou sua assinatura não está com status ativo.\n\nSe você realmente comprou, entre em contato com o suporte usando o comando /suporte')
        return await endConversation(ctx);
    }
})

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
        return await getDataAssinaturaFromUser(email);
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
        userData.discountCouponId = await getUserDiscountCoupon();
        userData.username = chat.username;
        userData.paymentMethod = CacheService.getPaymentMethod();
        userData.plano = CacheService.getPlano();
        userData.fullName = CacheService.getFullName();
        userData.phone = CacheService.getPhone();
        userData.email = CacheService.getEmail();
        userData.dataAssinatura = await getUserDataAssinatura();
        userData.diasAteFimDaAssinatura = await pegarDiasSobrandoDeAssinatura(CacheService.getPlano(), CacheService.getEmail())

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

const enviarCanaisDeTelegram = async (ctx: Context, plano: string, dataAssinatura: string) => {
    let chatName;
    let chatId;
    let linkChatEspecifico;
    let linkCanalGeral;
    log(`Enviando canais de Telegram para usuário ${ctx.chat.id}`)
    try {
        [chatName, chatId] = await getChat(plano, dataAssinatura);
        linkChatEspecifico = getChatInviteLink(chatId);
        linkCanalGeral = getChatInviteLink(process.env.ID_CANAL_GERAL)
    } catch (err) {
        logError(`ERRO AO ENVIAR CANAIS DE TELEGRAM`, err)
        await enviarMensagemDeErroAoAdmin(`ERRO AO ENVIAR CANAIS DE TELEGRAM`, err);
        throw err;
    }

    log(`Canal Geral enviado para ${ctx.chat.id}`)
    log(`Canal Específico (${plano}) enviado para ${ctx.chat.id}`)

    const teclado = Markup.inlineKeyboard([
        Markup.urlButton('Canal Geral', linkCanalGeral),
        Markup.urlButton(chatName, linkChatEspecifico)
    ])
    await ctx.reply('Seja bem-vindo(a)!')
    await ctx.reply('Clique agora nos dois botões e acesse nossos canais o quanto antes, logo esses botões vão expirar ⤵️', Extra.markup(teclado))
    return await ctx.replyWithMarkdown('Caso eles já tenham expirado quando você clicar, utilize o comando /canais para recebê-los atualizados!\n\n*OBS.: Você só pode receber os canais por esse comando 2 vezes.*');
}

const endConversation = async (ctx) => {
    log(`Conversa com ${ctx.chat.id} finalizada`)
    CacheService.clearAllUserData();
    return ctx.scene.leave();
}

export default analysisScene;