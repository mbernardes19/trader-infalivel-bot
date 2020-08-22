import Axios from 'axios';
import { MonetizzeTrasactionOptions, MonetizzeTransactionResponse } from '../interfaces/Monetizze';
import { log, logError } from '../logger';

const createRequest = () => Axios.create({
    baseURL: 'https://api.monetizze.com.br/2.1/',
    headers: {'X_CONSUMER_KEY': `${process.env.MONETIZZE_KEY}`}
})

const createAuthorizedRequest = (token: string) => {
    return Axios.create({
        baseURL: 'https://api.monetizze.com.br/2.1/',
        headers: {'Content-Type': 'application/x-www-form-urlencoded', 'TOKEN': `${token}`}
    })
};

const auth = async (): Promise<string> => {
    try {
        const response = await createRequest().get('/token')
        return response.data.token
    } catch (err) {
        throw err
    }
}


const getTransactions = async (token: string, options: MonetizzeTrasactionOptions): Promise<MonetizzeTransactionResponse> => {
    try {
        const response = await createAuthorizedRequest(token).get('/transactions', {params: options})
        return response.data
    } catch (err) {
        throw err
    }
}

const getMonetizzeTransaction = async (options: MonetizzeTrasactionOptions): Promise<MonetizzeTransactionResponse> => {
    log(`Fazendo requisição para servidor Monetizze`)
    try {
        const token  = await auth()
        return await getTransactions(token, options)
    } catch(err) {
        logError(`ERRO AO REALIZAR REQUISIÇÃO PARA SERVIDOR MONETIZZE`, err);
        throw err
    }
}

const getMonetizzeProductTransaction = async (options?: MonetizzeTrasactionOptions): Promise<MonetizzeTransactionResponse> => {
    try {
        return await getMonetizzeTransaction({productId: process.env.PRODUCT_ID, ...options})
    } catch(err) {
        throw err
    }
}

export { createRequest, createAuthorizedRequest, auth, getTransactions, getMonetizzeTransaction, getMonetizzeProductTransaction}
