import util from 'util';
import { Connection } from 'mysql';
import User from './model/User';

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

export { addUserToDatabase, getUserByTelegramId }
