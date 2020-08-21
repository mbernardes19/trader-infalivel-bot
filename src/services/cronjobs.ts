import Cron from 'node-cron';
// import {get} from './monetizze';
import { getAllInvalidUsers } from '../dao';
import { connection } from '../db';
import CacheService from './cache';
import { Telegram } from 'telegraf';
import { getChat } from './chatResolver';

const startCronJobs = () => {
    removeInvalidUsersAtEveryTime();
    updateUsersStatusAssinaturaAtEveryTime();
}

const removeInvalidUsersAtEveryTime = () => {
    const each15Minutes = '*/15 * * * *';
    const telegramClient = CacheService.get<Telegram>('telegramClient');

    Cron.schedule(each15Minutes, async () => {
        const usersToKick = []
        const chatIdsPromises = []
        const invalidUsers = await getAllInvalidUsers(connection);
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
        })

        try {
            await Promise.all(usersToKick);
        } catch (err) {
            throw err;
        }
    });
}

const updateUsersStatusAssinaturaAtEveryTime = () => {
    const eachHour = '0 */1 * * *';
    Cron.schedule(eachHour, () => {
        
    });
}

export { startCronJobs }