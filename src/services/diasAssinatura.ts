import { differenceInDays } from 'date-fns'
import { Planos } from '../model/Planos'

const pegarDiasSobrandoDeAssinatura = (plano: string, dataAssinatura: string) => {
    let diasDeAssinatura
    switch (plano) {
        case Planos.SILVER:
            diasDeAssinatura = 30
            break;
        case Planos.GOLD:
            diasDeAssinatura = 90
            break;
        case Planos.DIAMOND:
            diasDeAssinatura = 180
            break;
        case Planos.BLACK_DIAMOND:
            diasDeAssinatura = 365
            break;
    }
    const ano = parseInt(dataAssinatura.substring(0,4), 10)
    const mes = parseInt(dataAssinatura.substring(5,7),10)
    const dia = parseInt(dataAssinatura.substring(8,10),10)
    const hoje = new Date();
    const diasDeUso = differenceInDays(hoje, new Date(ano, mes-1, dia))
    const diasParaTerminar = diasDeAssinatura - diasDeUso
    return diasParaTerminar
}

export { pegarDiasSobrandoDeAssinatura }