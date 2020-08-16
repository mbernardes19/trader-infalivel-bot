import { getMonetizzeProductTransaction } from './request';
import CacheService from './cache';
import { log } from '../logger';

const getDiscountCouponIdFromUser = async (userEmail, userPlano) => {
    const transaction = await getMonetizzeProductTransaction({ email: userEmail })
    const transactionFromPlano = transaction.dados.filter(dado => dado.venda.plano === userPlano);
    return transactionFromPlano[0].venda.cupom;
}

const verifyUserPurchase = async (ctx) => {
    const email = CacheService.get<string>('email');
    try {
        const response = await getMonetizzeProductTransaction({ email, "status[]": [2] })
        log(`Verificando compra de usuário na Monetizze ${JSON.stringify(response)}`)
        return response.recordCount === "0" ? true : false;
    } catch (err) {
        throw err
    }
}


export { getDiscountCouponIdFromUser, verifyUserPurchase }