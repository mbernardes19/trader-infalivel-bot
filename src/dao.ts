import util from 'util';
import { Connection, MysqlError } from 'mysql';
import User from './model/User';

const addUserToDatabase = async (user: User, connection: Connection) => {
    const userData = user.getUserData();
    const { telegramId, username, fullName, plano, discountCouponId, phone, email, paymentMethod } = userData;
    const query = util.promisify(connection.query).bind(connection)
    try {
        await query(`insert into Users (id_telegram, username_telegram, plano, cupom_desconto, nome_completo, telefone, email, forma_de_pagamento, status_assinatura) values ('${telegramId}', '${username}', '${plano}', '${discountCouponId}', '${fullName}', '${phone}', '${email}', '${paymentMethod}', 'ativa')`)
    } catch (err) {
        throw err
    }
    // connection.end((err: MysqlError) => {
    //     if (err) {
    //         console.log(err)
    //         return;
    //     }
    //     console.log('Conexão finalizada com sucesso')
    // });
}

export { addUserToDatabase }
