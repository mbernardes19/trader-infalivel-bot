import { Telegram } from 'telegraf';
import { log, logError, enviarMensagemDeErroAoAdmin } from '../logger';

const { ID_CANAL_BASIC, ID_CANAL_VIP, ID_GRUPO_PREMIUM } = process.env

let linkCanalBasic = ''
let linkCanalVip = ''
let linkGrupoPremium = ''

const exportChatsInviteLink = async (telegramClient: Telegram) => {
    log(`🔗💬 GERANDO NOVOS LINKS PARA OS CHAT!`)
    try {
        linkCanalBasic = await telegramClient.exportChatInviteLink(ID_CANAL_BASIC)
        linkCanalVip = await telegramClient.exportChatInviteLink(ID_CANAL_VIP)
        linkGrupoPremium = await telegramClient.exportChatInviteLink(ID_GRUPO_PREMIUM)
        log(`🔗💬 LINKS PARA CHATS GERADOS!`)
        log(`🔗💬 BASIC: ${linkCanalBasic}, VIP: ${linkCanalVip}, PREMIUM: ${linkGrupoPremium}`)
    } catch (err) {
        logError(`ERRO AO GERAR NOVOS LINKS PARA CHATS`, err)
        await enviarMensagemDeErroAoAdmin(`ERRO AO GERAR NOVOS LINKS PARA CHATS`, err)
    }
}

const startChatLinkValidation = (telegramClient: Telegram) => {
    log(`VALIDAÇÃO DE LINKS INICIADA!`);
    exportChatsInviteLink(telegramClient);
    setInterval(async () => await exportChatsInviteLink(telegramClient), 300000)
}

const getChatInviteLink = (chatId: number) => {
    log(`Pegando link para chat ${chatId}`)
    console.log('VIP', process.env.ID_CANAL_VIP)
    switch(chatId) {
        case parseInt(process.env.ID_CANAL_BASIC):
            return {chatName: 'BASIC', invite: linkCanalBasic};
        case parseInt(process.env.ID_CANAL_VIP):
            return {chatName: 'VIP', invite: linkCanalVip};
        case parseInt(process.env.ID_GRUPO_PREMIUM):
            return {chatName: 'PREMIUM', invite: linkGrupoPremium};

        default:
            throw new Error(`Chat buscado não existe ${chatId}`)
    }
}

export { getChatInviteLink, startChatLinkValidation, exportChatsInviteLink }