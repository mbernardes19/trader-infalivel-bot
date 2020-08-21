import { getMonetizzeProductTransaction } from './request';
import { log } from '../logger';
import CacheService from './cache';

const getDiscountCouponIdFromUser = async (userEmail, userPlano) => {
    try {
        const transaction = await getMonetizzeProductTransaction({ email: userEmail })
        log(`Pegando cupom de desconto do usuário na Monetizze`);
        const transactionFromPlano = transaction.dados.filter(dado => dado.venda.plano === userPlano);
        return transactionFromPlano[0].venda.cupom !== null ? transactionFromPlano[0].venda.cupom : '0';
    } catch (err) {
        throw err;
    }
}

const getDataAssinaturaFromUser = async (userEmail: string) => {
    try {
        const transaction = await getMonetizzeProductTransaction({ email: userEmail })
        log(`Pegando data de assinatura do usuário na Monetizze`);
        return transaction.dados[0].venda.dataInicio;
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
            if (responseFinalizadas.recordCount === "0") {
                return false;
            }
            if (responseFinalizadas.dados[0].assinatura && responseFinalizadas.dados[0].assinatura.status !== 'Ativa') {
                return false;
            }
            return true;
       }
       if (responseCompletas.dados[0].assinatura && responseCompletas.dados[0].assinatura.status !== 'Ativa') {
           return false;
       }
       return true;
    } catch (err) {
        throw err
    }
}

const confirmPlano = async (email) => {
    try {
        const responseCompletas = await getMonetizzeProductTransaction({ email })
        log(`Confirmando plano de usuário na Monetizze ${JSON.stringify(responseCompletas)}`)
        return responseCompletas.dados[0].plano.codigo !== CacheService.getPlano() ? false : true;
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

const getUsersNewStatusAssinatura = async () => {
    try {
        const response = await getMonetizzeProductTransaction()
        return response.dados.map(dados => dados.assinatura.status)
    } catch (err) {
        throw err;
    }
}

export { getDiscountCouponIdFromUser, verifyUserPurchase, confirmPlano, getDataAssinaturaFromUser, checkIfPaymentMethodIsBoleto, getUsersNewStatusAssinatura }
