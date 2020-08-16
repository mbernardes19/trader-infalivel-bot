import { BaseScene } from 'telegraf';
import CacheService from '../services/cache';
import { getDiscountCouponIdFromUser, verifyUserPurchase, checkIfPaymentMethodIsBoleto } from '../services/monetizze';
import UserData from '../model/UserData';
import User from '../model/User';
import { logError, log } from '../logger';
import { addUserToDatabase } from '../dao';
import { connection } from '../db';
import { getChat } from '../services/chatResolver';

const analysisScene = new BaseScene('analysis')

analysisScene.command('reiniciar', ctx => {
    CacheService.clearAllUserData()
    return ctx.scene.enter('welcome')
})

analysisScene.enter(async (ctx) => {
    await ctx.reply('Verificando sua compra nos servidores da Monetizze...');
    const email = CacheService.get<string>('email');
    let isPurchaseApproved;
    try {
        isPurchaseApproved = await verifyUserPurchase(email);
    } catch (err) {
        logError(`Erro ao verificar compra de usuário na Monetizze`, err)
        await ctx.reply('Me desculpe... Ocorreu um erro ao verificar a sua compra na Monetizze. Por favor, tente iniciar uma conversa comigo novamente.');
        endConversation(ctx);
    }

    if (isPurchaseApproved) {
        try {
            const userData = await getUserData(ctx);
            const newUser = new User(userData);
            await saveUser(newUser);
            console.log(newUser);
        } catch (err) {
            if (err.errno === 1062) {
                logError(`Usuário já existe no banco de dados`, err);
                await ctx.reply(`Você já ativou sua assinatura Monettize comigo antes.`)
                endConversation(ctx);
            } else {
                logError('Erro ao adicionar usuário ao banco de dados', err)
                await ctx.reply(`Sua compra na Monetizze foi confirmada, porém ocorreu um erro ao ativar sua assinatura na Monetizze.`)
                endConversation(ctx);
            }
        } finally {
            endConversation(ctx);
        }
    } else {
        let isPaymentBoleto;
        try {
            isPaymentBoleto = await checkIfPaymentMethodIsBoleto(email);
        } catch (err) {
            logError('Desculpe, ocorreu um erro ao verificar se pagamento foi feito no boleto. Tente iniciar uma conversa comigo de novo', err)
        }
        if (isPaymentBoleto) {
            await ctx.reply('Verifiquei que sua compra no boleto ainda não foi aprovada.')
            await ctx.reply('Inicie uma conversa comigo novamente em 1 a 3 dias úteis para ter acesso aos nossos canais!')
            endConversation(ctx);
        }
        await ctx.reply('Nenhuma compra confirmada do seu usuário foi encontrada na Monetizze.')
        endConversation(ctx);
    }
})

const getUserDiscountCoupon = async () => {
    const email = CacheService.get<string>('email');
    const plano = CacheService.get<string>('plano');
    try {
        return await getDiscountCouponIdFromUser(email, plano)
    } catch (err) {
        logError(`Erro ao pegar cupom de desconto do usuário ${email}`, err)
    }
}

const getUserData = async (ctx): Promise<UserData> => {
    const userData: UserData = new UserData();

    userData.telegramId = ctx.chat.id;
    userData.discountCouponId = await getUserDiscountCoupon();
    userData.username = ctx.message.from.username ? ctx.message.from.username : ctx.message.from.first_name;
    userData.paymentMethod = CacheService.get<string>('forma_de_pagamento');
    userData.plano = CacheService.get<string>('plano');
    userData.fullName = CacheService.get<string>('nome_completo');
    userData.phone = CacheService.get<string>('telefone');
    userData.email = CacheService.get<string>('email');

    log(`Username Telegram definido ${userData.username}`)
    log(`Id Telegram definido ${userData.telegramId}`)
    log(`Cupom de desconto definido ${userData.discountCouponId}`)

    return userData;
}

const saveUser = async (newUser) => {
    try {
        await addUserToDatabase(newUser, connection)
    } catch (err) {
        throw err;
    }
}

const endConversation = async (ctx) => {
    CacheService.clearAllUserData();
    return ctx.scene.leave();
}

export default analysisScene;