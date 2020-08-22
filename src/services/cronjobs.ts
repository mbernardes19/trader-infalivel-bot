import Cron from 'node-cron';
import { getAllInvalidNonKickedUsers, markUserAsKicked, getAllValidUsers, updateUsersStatusAssinatura } from '../dao';
import { connection } from '../db';
import CacheService from './cache';
import { Telegram } from 'telegraf';
import { getChat } from './chatResolver';

const startCronJobs = () => {
    removeInvalidUsersAtEveryTime();
    updateValidUsersStatusAssinaturaAtEveryTime();
    updateValidUsersStatusAssinaturaAtEveryTime();
}

const removeInvalidUsersAtEveryTime = () => {
    const each15Minutes = '*/15 * * * *';
    const telegramClient = CacheService.get<Telegram>('telegramClient');

    Cron.schedule(each15Minutes, async () => {
        const usersToKick = []
        const chatIdsPromises = []
        const invalidUsers = await getAllInvalidNonKickedUsers(connection);
        invalidUsers.forEach(invalidUser => {
            chatIdsPromises.push(getChat(invalidUser.plano, invalidUser.data_assinatura))
        })
        let chatIds;
        try {
            chatIds = await Promise.all(chatIdsPromises);
        } catch (err) {
            throw err;
        }

        invalidUsers.forEach((invalidUser, index) => {
            usersToKick.push(telegramClient.kickChatMember(process.env.ID_CANAL_GERAL, invalidUser.id_telegram));
            usersToKick.push(telegramClient.kickChatMember(chatIds[index][1], invalidUser.id_telegram));
            usersToKick.push(markUserAsKicked(invalidUser.id_telegram, connection))
        })

        try {
            await Promise.all(usersToKick);
        } catch (err) {
            throw err;
        }
    });
}

const updateValidUsersStatusAssinaturaAtEveryTime = () => {
    const eachHour = '0 */1 * * *';

    Cron.schedule(eachHour, async () => {
        const allUsers = await getAllValidUsers(connection);
        await updateUsersStatusAssinatura(allUsers, connection);
    });
}

export { startCronJobs }