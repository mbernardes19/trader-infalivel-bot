import { BaseScene } from 'telegraf';
import CacheService from '../services/cache';
import { getDiscountCouponIdFromUser, verifyUserPurchase } from '../services/monetizze';
import { getMonetizzeProductTransaction } from  '../services/request';
import UserData from '../model/UserData';
import User from '../model/User';

const analysisScene = new BaseScene('analysis')
analysisScene.enter(async (ctx) => {
    await ctx.reply('Olá!');
    const isPurchaseApproved = await verifyUserPurchase(ctx);
    const re = await getMonetizzeProductTransaction();
    console.log(re.dados[0])
    if (isPurchaseApproved) {
        const userData = await getUserData(ctx);
        const newUser = new User(userData);
        console.log(newUser);
    }
})

const getUserDiscountCoupon = async () => {
    const email = 'rs2787638@gmail.com'//CacheService.get<string>('email');
    const plano = CacheService.get<string>('plano');
    return await getDiscountCouponIdFromUser(email, plano)
}

const getUserData = async (ctx): Promise<UserData> => {
    const userData: UserData = new UserData();

    userData.telegramId = ctx.chat.id;
    userData.discountCouponId = await getUserDiscountCoupon();
    userData.username = ctx.message.from.username ? ctx.message.from.username : ctx.message.from.first_name;
    userData.paymentMethod = CacheService.get<string>('forma_de_pagamento');
    userData.plano = CacheService.get<string>('plano');
    userData.fullName = CacheService.get<string>('name');
    userData.phone = CacheService.get<string>('telefone');
    userData.email = 'rs2787638@gmail.com' //CacheService.get<string>('email');

    return userData;
}

export default analysisScene;