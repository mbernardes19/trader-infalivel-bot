import Cron from 'node-cron';
import { getAllInvalidNonKickedUsers, markUserAsKicked, getAllValidUsers, updateUsersStatusAssinatura } from '../dao';
import { connection } from '../db';
import CacheService from './cache';
import { Telegram } from 'telegraf';
import { getChat } from './chatResolver';
import { log, logError } from '../logger';

const startCronJobs = () => {
    try {
        removeInvalidUsersAtEveryTime();
        updateValidUsersStatusAssinaturaAtEveryTime();
        updateValidUsersStatusAssinaturaAtEveryTime();
    } catch (err) {
        logError(`ERRO AO EXECUTAR CRONJOB`, err)
    }
}

const removeInvalidUsersAtEveryTime = () => {
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
            throw err;
        }
    });
}

const updateValidUsersStatusAssinaturaAtEveryTime = () => {
    const eachHour = '0 */1 * * *';

    Cron.schedule(eachHour, async () => {
        log(`⏱️ Iniciando cronjob para atualizar status de assinatura de usuários válidos`)

        let allUsers = [];
        try {
            allUsers = await getAllValidUsers(connection);
            await updateUsersStatusAssinatura(allUsers, connection);
        } catch (err) {
            logError(`⏱️ ERRO AO ATUALIZAR STATUS DE ASSINATURA DE USUÁRIOS VÁLIDOS ${allUsers}`, err)
            throw err;
        }
    });
}

export { startCronJobs }