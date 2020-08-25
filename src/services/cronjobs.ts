import Cron from 'node-cron';
import { getAllInvalidNonKickedUsers, markUserAsKicked, getAllValidUsers, updateUsersStatusAssinatura, updateUsersDiasAteFimAssinatura } from '../dao';
import { connection } from '../db';
import CacheService from './cache';
import { Telegram } from 'telegraf';
import { getChat } from './chatResolver';
import { log, logError, enviarMensagemDeErroAoAdmin } from '../logger';
import User from '../model/User';

const startCronJobs = () => {
    try {
        removeInvalidUsers();
        updateValidUsersStatusAssinatura();
        updateValidUsersDiasAteFimAssinatura();
    } catch (err) {
        logError(`ERRO AO EXECUTAR CRONJOB`, err)
    }
}

const removeInvalidUsers = () => {
    const each15Minutes = '*/15 * * * *';
    const telegramClient = CacheService.get<Telegram>('telegramClient');

    Cron.schedule(each15Minutes, async () => {
        log(`⏱️ Iniciando cronjob para remover usuários inválidos`)
        const usersToKick = []
        const chatIdsPromises = []

        let invalidUsers;
        try {
            invalidUsers = await getAllInvalidNonKickedUsers(connection);
            log(`⏱️ Pegando usuários inválidos ${invalidUsers}`)
        } catch (err) {
            throw err;
        }
        invalidUsers.forEach(invalidUser => {
            chatIdsPromises.push(getChat(invalidUser.plano, invalidUser.data_assinatura))
        })

        let chatIds;
        try {
            chatIds = await Promise.all(chatIdsPromises);
            log(`⏱️ Pegando chats com usuários inválidos ${chatIds}`)
        } catch (err) {
            logError(`⏱️ ERRO AO PEGAR CHATS COM USUÁRIOS INVÁLIDOS ${invalidUsers}`, err)
            await enviarMensagemDeErroAoAdmin(`⏱️ ERRO AO PEGAR CHATS COM USUÁRIOS INVÁLIDOS ${invalidUsers}`, err);
            throw err;
        }

        invalidUsers.forEach((invalidUser, index) => {
            usersToKick.push(telegramClient.kickChatMember(process.env.ID_CANAL_GERAL, invalidUser.id_telegram));
            usersToKick.push(telegramClient.kickChatMember(chatIds[index][1], invalidUser.id_telegram));
            usersToKick.push(markUserAsKicked(invalidUser.id_telegram, connection))
        })

        try {
            await Promise.all(usersToKick);
            log(`⏱️ Usuários inválidos removidos ${usersToKick}`)
        } catch (err) {
            logError(`⏱️ ERRO AO REMOVER USUÁRIOS INVÁLIDOS ${usersToKick}`, err)
            await enviarMensagemDeErroAoAdmin(`⏱️ ERRO AO REMOVER USUÁRIOS INVÁLIDOS ${usersToKick}`, err)
            throw err;
        }
    });
}

const updateValidUsersStatusAssinatura = () => {
    const eachHour = '0 */1 * * *';

    Cron.schedule(eachHour, async () => {
        log(`⏱️ Iniciando cronjob para atualizar status de assinatura de usuários válidos`)

        let allUsers = [];
        try {
            allUsers = await getAllValidUsers(connection);
            await updateUsersStatusAssinatura(allUsers, connection);
        } catch (err) {
            logError(`⏱️ ERRO AO ATUALIZAR STATUS DE ASSINATURA DE USUÁRIOS VÁLIDOS ${allUsers}`, err)
            enviarMensagemDeErroAoAdmin(`⏱️ ERRO AO ATUALIZAR STATUS DE ASSINATURA DE USUÁRIOS VÁLIDOS ${allUsers}`, err)
            throw err;
        }
    });
}

const updateValidUsersDiasAteFimAssinatura = async () => {
    const eachDayAt8AM = '0 8 * * *';

    Cron.schedule(eachDayAt8AM, async () => {
        log(`⏱️ Iniciando cronjob para atualizar dias até fim de assinatura de usuários válidos`)

        let allUsers = [];
        try {
            allUsers = await getAllValidUsers(connection);
            await updateUsersDiasAteFimAssinatura(allUsers, connection);
            const allUsersUpdated = await getAllValidUsers(connection);
            await sendMessageToUsersCloseToEndAssinatura(allUsersUpdated)
        } catch (err) {
            logError(`ERRO AO ATUALIZAR DIAS ATÉ FIM DE ASSINATURA DE USUÁRIOS ${allUsers}`, err);
            enviarMensagemDeErroAoAdmin(`⏱️ ERRO AO ATUALIZAR DIAS ATÉ FIM DE ASSINATURA DE USUÁRIOS VÁLIDOS ${JSON.stringify(allUsers)}`, err)
            throw err;
        }
    })
}

const sendMessageToUsersCloseToEndAssinatura = async (users: User[]) => {
    const telegramClient = CacheService.get<Telegram>('telegramClient');
    const usersCloseToEndAssinatura = users.filter(user => user.getUserData().diasAteFimDaAssinatura <= 3)
    const getChats = []
    const actions = []
    const usersToKick: User[] = []
    usersCloseToEndAssinatura.forEach(user => {
        if (user.getUserData().diasAteFimDaAssinatura === 3) {
            actions.push(telegramClient.sendMessage(user.getUserData().telegramId, 'Faltam 3 dias'))
        }
        if (user.getUserData().diasAteFimDaAssinatura === 2) {
            actions.push(telegramClient.sendMessage(user.getUserData().telegramId, 'Faltam 2 dias'))
        }
        if (user.getUserData().diasAteFimDaAssinatura === 1) {
            actions.push(telegramClient.sendMessage(user.getUserData().telegramId, 'Falta 1 dia'))
        }
        if (user.getUserData().diasAteFimDaAssinatura === 0) {
            getChats.push(getChat(user.getUserData().plano, user.getUserData().dataAssinatura))
            usersToKick.push(user)
            actions.push(telegramClient.sendMessage(user.getUserData().telegramId, 'Você foi removido'))
        }
    })

    let chatsIds;
    try {
        await Promise.all(actions);
        const chats = await Promise.all(getChats);
        chatsIds = chats.map(chat => chat[1]);
    } catch (err) {
        throw err;
    }

    const kick = []

    usersToKick.forEach((user, index) => {
        kick.push(telegramClient.kickChatMember(process.env.ID_CANAL_GERAL, parseInt(user.getUserData().telegramId, 10)))
        kick.push(telegramClient.kickChatMember(chatsIds[index], parseInt(user.getUserData().telegramId, 10)))
        kick.push(markUserAsKicked(user.getUserData().telegramId, connection))
    })

    try {
        await Promise.all(kick)
    } catch (err) {
        throw err;
    }

};

export { startCronJobs }