import { getMonetizzeProductTransaction } from './request';
import { isBefore } from 'date-fns'
import { Planos } from '../model/Planos';
import CacheService from './cache';

export async function getChat(plano: string, dataAssinatura: string) {
    console.log('DATA ASSINATURA', dataAssinatura);
    let chat;
    let chatName;
    if (process.env.NODE_ENV === 'production') {
        switch(plano) {
            case Planos.SILVER:
                chat = process.env.ID_CANAL_SILVER;
                chatName = 'Canal Prata'
                break;
            case Planos.GOLD:
                chat = process.env.ID_CANAL_GOLD;
                chatName = 'Canal Gold'
                break;
            case Planos.DIAMOND:
                chat = process.env.ID_CANAL_DIAMOND;
                chatName = 'Canal Diamond'
                break;
            case Planos.BLACK_DIAMOND:
                chat = process.env.ID_GRUPO_BLACK_DIAMOND;
                chatName = 'Grupo Black Diamond'
                break;
            default:
                throw new Error(`Plano ${plano} não existe`)
        }
    } else {
        switch(plano) {
            case Planos.SILVER:
                chat = process.env.ID_CANAL_TEST_SILVER;
                chatName = 'Canal Prata'
                break;
            case Planos.GOLD:
                chat = process.env.ID_CANAL_TEST_GOLD;
                chatName = 'Canal Gold'
                break;
            case Planos.DIAMOND:
                chat = process.env.ID_CANAL_TEST_DIAMOND;
                chatName = 'Canal Diamond'
                break;
            case Planos.BLACK_DIAMOND:
                chat = process.env.ID_GRUPO_TEST_BLACK_DIAMOND;
                chatName = 'Grupo Black Diamond'
                break;
            default:
                throw new Error(`Plano ${plano} não existe`)
        }
    }

    if (process.env.NODE_ENV === 'production') {
        if (checkIfIsBefore(dataAssinatura, new Date(2020,7,6))) {
            console.log(`${dataAssinatura} vai pro GOLD`)
            return ['Canal Gold', process.env.ID_CANAL_GOLD]
        } else {
            console.log(`${dataAssinatura} vai pra DIVISAO`)
            return [chatName, chat]
        }
    } else {
        if (checkIfIsBefore(dataAssinatura, new Date(2020,7,6))) {
            console.log(`${dataAssinatura} vai pro GOLD`)
            return ['Canal Gold', process.env.ID_CANAL_TEST_GOLD]
        } else {
            console.log(`${dataAssinatura} vai pra DIVISAO`)
            return [chatName, chat]
        }
    }

    // res.dados.map(dado => {
    //     const dataAssinatura = dado.assinatura.data_assinatura
    //     const ano = parseInt(dataAssinatura.substring(0,4), 10)
    //     const mes = parseInt(dataAssinatura.substring(5,7),10)
    //     const dia = parseInt(dataAssinatura.substring(8,10),10)
    //     console.log(dado.assinatura.data_assinatura)
    //     console.log(isBefore(new Date(ano, mes-1, dia), new Date(2020,7,6)))
    // })
}

const checkIfIsBefore = (data1: string, data2:Date) => {
    const ano = parseInt(data1.substring(0,4), 10)
    const mes = parseInt(data1.substring(5,7),10)
    const dia = parseInt(data1.substring(8,10),10)
    const result = isBefore(new Date(ano, mes-1, dia), data2)
    console.log(result);
    return result;
}