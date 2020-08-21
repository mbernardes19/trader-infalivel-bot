import util from 'util';
import { Connection } from 'mysql';
import User from './model/User';
import { getUsersNewStatusAssinatura } from './services/monetizze';


const addUserToDatabase = async (user: User, connection: Connection) => {
    const userData = user.getUserData();
    const { telegramId, username, fullName, plano, discountCouponId, phone, email, paymentMethod, dataAssinatura } = userData;
    const query = util.promisify(connection.query).bind(connection)
    try {
        await query(`insert into Users (id_telegram, user_telegram, plano, cupom_desconto, nome_completo, telefone, email, forma_de_pagamento, data_assinatura, status_assinatura) values ('${telegramId}', '${username}', '${plano}', '${discountCouponId}', '${fullName}', '${phone}', '${email}', '${paymentMethod}', '${dataAssinatura}', 'ativa')`)
    } catch (err) {
        throw err
    }
}

const getUserByTelegramId = async (telegramId: string|number, connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        const result = await query(`select * from Users where id_telegram='${telegramId}'`);
        return result[0];
    } catch (err) {
        throw err
    }
}

const getAllUsers = async (connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        return await query(`select * from Users`);
    } catch (err) {
        throw err;
    }
}

const getAllInvalidUsers = async (connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        return await query(`select * from Users where not status_assinatura='ativa'`);
    } catch (err) {
        throw err;
    }
}

const updateAllUsersStatusAssinatura = async (connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    const newStatusAssinatura = await getUsersNewStatusAssinatura()
    const allUsers = await getAllUsers(connection)
    const updates = []
    allUsers.forEach((user, index) => {
        updates.push(query(`update Users set status_assinatura='${newStatusAssinatura[index]}' where id_telegram='${user.id}'`));
    })
    try {
        await Promise.all(updates);
    } catch (err) {
        throw err;
    }
}

export { addUserToDatabase, getUserByTelegramId, getAllInvalidUsers, updateAllUsersStatusAssinatura }
