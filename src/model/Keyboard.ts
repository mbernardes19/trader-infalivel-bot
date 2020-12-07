import { Markup } from 'telegraf'
import { Planos, PlanosEduzz } from './Planos';

export default class Keyboard {
    static SUPPORT = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE 1', 't.me/diego_sti')],
        [Markup.urlButton('👉 SUPORTE 2', 't.me/julianocba')],
    ]);

    static CONFIRMATION = Markup.inlineKeyboard([
        Markup.callbackButton('👍 Sim', 'sim'), Markup.callbackButton('👎 Não', 'nao')
    ])

    static PAYMENT_OPTIONS = Markup.inlineKeyboard([
        [Markup.callbackButton('💳 Cartão de Crédito', 'cartao_de_credito')],
        [Markup.callbackButton('📄 Boleto', 'boleto')]
    ])

    static PLANOS_OPTIONS_MONETIZZE = Markup.inlineKeyboard([
        [Markup.callbackButton('🥈 Prata/Silver', '78914')],
        [Markup.callbackButton('🥇 Gold', '90965')],
        [Markup.callbackButton('💎 Diamond', '90966')],
        [Markup.callbackButton('💎⬛ Black Diamond', '91261')]
    ])

    static PLANOS_OPTIONS_EDUZZ = Markup.inlineKeyboard([
        [Markup.callbackButton('BASIC', PlanosEduzz.BASIC)],
        [Markup.callbackButton('VIP', PlanosEduzz.VIP)],
        [Markup.callbackButton('PREMIUM', PlanosEduzz.PREMIUM)]
    ])

}