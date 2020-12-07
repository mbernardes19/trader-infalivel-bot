import { PlanosEduzz } from '../model/Planos';
import { log, logError } from '../logger';

export function getChats(plano: string): number[] {
    let chats = [];
    log(`💬 Pegando para plano ${plano}`)
    if (process.env.NODE_ENV === 'production') {
        switch(plano) {
            case PlanosEduzz.BASIC:
                chats.push(parseInt(process.env.ID_CANAL_BASIC));
                break;
            case PlanosEduzz.VIP:
                chats.push(parseInt(process.env.ID_CANAL_VIP));
                break;
            case PlanosEduzz.PREMIUM:
                chats.push(parseInt(process.env.ID_CANAL_VIP));
                chats.push(parseInt(process.env.ID_GRUPO_PREMIUM));
                break;
            case PlanosEduzz.basic:
                chats.push(parseInt(process.env.ID_CANAL_BASIC));
                break;
            default:
                throw new Error(`Plano ${plano} não existe`)
        }
    } else {
        switch(plano) {
            case PlanosEduzz.BASIC:
                chats.push(parseInt(process.env.ID_CANAL_BASIC));
                break;
            case PlanosEduzz.VIP:
                chats.push(parseInt(process.env.ID_CANAL_VIP));
                break;
            case PlanosEduzz.PREMIUM:
                chats.push(parseInt(process.env.ID_GRUPO_PREMIUM));
                break;
            case PlanosEduzz.basic:
                chats.push(parseInt(process.env.ID_CANAL_BASIC));
                break;
            default:
                throw new Error(`Plano ${plano} não existe`)
        }
    }

    try {
        return chats;
    } catch (err) {
        throw err
    }
}