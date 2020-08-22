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

const getAllValidUsers = async (connection: Connection): Promise<User[]> => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        const dbResults = await query(`select * from Users where status_assinatura = 'ativa'`);
        console.log('dbResults', dbResults);
        const users: User[] = dbResults.map(dbResult => User.fromDatabaseResult(dbResult))
        console.log('users', users)
        return users;
    } catch (err) {
        throw err;
    }
}

const getAllInvalidNonKickedUsers = async (connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        return await query(`select * from Users where not status_assinatura='ativa' and kickado='N'`);
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

const updateUsersStatusAssinatura = async (users: User[], connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection);
    const newStatusAssinatura = await getUsersNewStatusAssinatura(users);
    const updates = []
    users.forEach((user, index) => {
        updates.push(query(`update Users set status_assinatura='${newStatusAssinatura[index]}' where id_telegram='${user.getUserData().telegramId}'`));
    })
    try {
        await Promise.all(updates);
    } catch (err) {
        throw err;
    }
}

const markUserAsKicked = async (telegramId: string|number, connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        return await query(`update Users set kickado='S' where id_telegram='${telegramId}'`);
    } catch (err) {
        throw err;
    }
}

const updateViewChats = async (telegramId: string|number, connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        const [dbResult] = await query(`select ver_canais from Users where id_telegram='${telegramId}'`);
        const newVerCanais = parseInt(dbResult.ver_canais, 10) + 1;
        await query(`update Users set ver_canais=${newVerCanais} where id_telegram='${telegramId}'`);
    } catch (err) {
        throw err;
    }
}

export { addUserToDatabase, getUserByTelegramId, getAllValidUsers, getAllInvalidUsers, updateUsersStatusAssinatura, markUserAsKicked, getAllInvalidNonKickedUsers, updateViewChats }
