import { Telegram } from 'telegraf';
import CacheService from '../services/cache';
import { log, logError, enviarMensagemDeErroAoAdmin } from '../logger';

const { ID_CANAL_BASIC, ID_CANAL_VIP, ID_GRUPO_PREMIUM } = process.env

let linkCanalBasic = ''
let linkCanalVip = ''
let linkGrupoPremium = ''

const exportChatsInviteLink = async () => {
    log(`🔗💬 GERANDO NOVOS LINKS PARA OS CHAT!`)
    try {
        const telegramClient = CacheService.get<Telegram>('telegramClient')
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

const startChatLinkValidation = () => {
    log(`VALIDAÇÃO DE LINKS INICIADA!`);
    exportChatsInviteLink();
    setInterval(async () => await exportChatsInviteLink(), 300000)
}

const getChatInviteLink = (chatId: number) => {
    log(`Pegando link para chat ${chatId}`)
    switch(chatId) {
        case parseInt(ID_CANAL_BASIC):
            return {chatName: 'BASIC', invite: linkCanalBasic};
        case parseInt(ID_CANAL_VIP):
            return {chatName: 'VIP', invite: linkCanalVip};
        case parseInt(ID_GRUPO_PREMIUM):
            return {chatName: 'PREMIUM', invite: linkGrupoPremium};

        default:
            throw new Error(`Chat buscado não existe ${chatId}`)
    }
}

export { getChatInviteLink, startChatLinkValidation }