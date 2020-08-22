import { Telegram } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';

const { ID_CANAL_GERAL, ID_CANAL_SILVER, ID_CANAL_GOLD, ID_CANAL_DIAMOND, ID_GRUPO_BLACK_DIAMOND } = process.env

let linkCanalGeral = ''
let linkCanalSilver = ''
let linkCanalGold = ''
let linkCanalDiamond = ''
let linkGrupoBlackDiamond = ''

const exportChatsInviteLink = async () => {
    try {
        const telegramClient = CacheService.get<Telegram>('telegramClient')
        linkCanalGeral = await telegramClient.exportChatInviteLink(ID_CANAL_GERAL)
        linkCanalSilver = await telegramClient.exportChatInviteLink(ID_CANAL_SILVER)
        linkCanalGold = await telegramClient.exportChatInviteLink(ID_CANAL_GOLD)
        linkCanalDiamond = await telegramClient.exportChatInviteLink(ID_CANAL_DIAMOND)
        linkGrupoBlackDiamond = await telegramClient.exportChatInviteLink(ID_GRUPO_BLACK_DIAMOND)
    } catch (err) {
        console.log('erro exporta chat', err)
    }
}

const startChatLinkValidation = () => {
    log('COMEÇOU VALIDAÇÃO DE LINKS');
    exportChatsInviteLink();
    setInterval(async () => await exportChatsInviteLink(), 300000)
}

const getChatInviteLink = (chatId: number|string) => {
    switch(chatId) {
        case ID_CANAL_GERAL:
            return linkCanalGeral;
        case ID_CANAL_SILVER:
            return linkCanalSilver;
        case ID_CANAL_GOLD:
            return linkCanalGold;
        case ID_CANAL_DIAMOND:
            return linkCanalDiamond;
        case ID_GRUPO_BLACK_DIAMOND:
            return linkGrupoBlackDiamond;
        default:
            throw new Error(`Chat buscado não existe ${chatId}`)
    }
}

export { exportChatsInviteLink, getChatInviteLink, startChatLinkValidation }