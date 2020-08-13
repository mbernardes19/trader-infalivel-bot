import Axios from 'axios';
import { MonetizzeTrasactionOptions, MonetizzeTransactionResponse } from './interfaces/Monetizze';

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
    try {
        const token  = await auth()
        return await getTransactions(token, options)
    } catch(err) {
        throw err
    }
}

export { createRequest, createAuthorizedRequest, auth, getTransactions, getMonetizzeTransaction}
