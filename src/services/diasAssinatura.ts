import { differenceInDays } from 'date-fns'
import { Planos } from '../model/Planos'
import { getMonetizzeProductTransaction } from './request';

const pegarDiasSobrandoDeAssinatura = async (plano: string, email: string) => {
    const response = await getMonetizzeProductTransaction({email})
    let vencimentoBoleto;
    let ultimoPagamento;
    if (response.dados[0].venda.formaPagamento === 'Boleto') {
        vencimentoBoleto = response.dados[0].venda.boleto_vencimento
    } else {
        ultimoPagamento = response.dados[0].venda.dataInicio
    }
    let diasDeAssinatura
    switch (plano) {
        case Planos.SILVER:
            diasDeAssinatura = 30;
            break;
        case Planos.GOLD:
            diasDeAssinatura = 90;
            break;
        case Planos.DIAMOND:
            diasDeAssinatura = 180;
            break;
        case Planos.BLACK_DIAMOND:
            diasDeAssinatura = 365
            break;
    }
    if (response.dados[0].venda.formaPagamento === 'Boleto') {
        const dataVencimentoBoleto = toDate(vencimentoBoleto)
        const hoje = new Date();
        const diasParaTerminar = differenceInDays(dataVencimentoBoleto, hoje) + 1
        return diasParaTerminar
    } else {
        const dataUltimoPagamento = toDate(ultimoPagamento)
        const hoje = new Date();
        const diasDeUso = differenceInDays(hoje, dataUltimoPagamento)
        const diasParaTerminar = diasDeAssinatura - diasDeUso + 1
        return diasParaTerminar
}

}

const toDate = (dateString: string) => {
    const ano = parseInt(dateString.substring(0,4), 10)
    const mes = parseInt(dateString.substring(5,7),10)
    const dia = parseInt(dateString.substring(8,10),10)
    return new Date(ano, mes-1, dia)
}

export { pegarDiasSobrandoDeAssinatura, toDate }
