import { getMonetizzeProductTransaction } from './request';
import { log } from '../logger';

const getDiscountCouponIdFromUser = async (userEmail, userPlano) => {
    try {
        const transaction = await getMonetizzeProductTransaction({ email: userEmail })
        log(`Pegando cupom de desconto do usuário na Monetizze`);
        const transactionFromPlano = transaction.dados.filter(dado => dado.venda.plano === userPlano);
        return transactionFromPlano[0].venda.cupom;
    } catch (err) {
        throw err;
    }
}

const verifyUserPurchase = async (email) => {
    try {
        const responseCompletas = await getMonetizzeProductTransaction({ email, "status[]": 2 })
        log(`Verificando compra de usuário na Monetizze ${JSON.stringify(responseCompletas)}`)
        if (responseCompletas.recordCount === "0") {
            const responseFinalizadas = await getMonetizzeProductTransaction({ email, "status[]": 6 })
            return responseFinalizadas.recordCount === "0" ? false : true;
       }
       return true;
    } catch (err) {
        throw err
    }
}

const checkIfPaymentMethodIsBoleto = async (email) => {
    try {
        const response = await getMonetizzeProductTransaction({ email, "forma_pagamento[]": 3, "status[]": 1 })
        log(`Verificando se a compra na Monetizze foi feita por boleto e está aguardando pagamento ${JSON.stringify(response)}`)
        return response.recordCount === "0" ? false : true;
    } catch (err) {
        throw err;
    }
}


export { getDiscountCouponIdFromUser, verifyUserPurchase, checkIfPaymentMethodIsBoleto }