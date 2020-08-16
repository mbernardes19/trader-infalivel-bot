import { TELEFONE, EMAIL, CARTAO, BOLETO, SIM, NAO, PLANO } from '../util/regex';

const validate = (informacao, dado) => {
    switch(informacao) {
        case 'telefone':
            return TELEFONE.test(dado.replace(/ /g, "")) ?
                {temErro: false, mensagemDeErro: ""} :
                {temErro: true, mensagemDeErro: "Telefone inválido. Certifique-se de estar inserindo somente números e o DDD (sem o zero) junto."}
        case 'email':
            return EMAIL.test(dado) ?
                {temErro: false, mensagemDeErro: ""} :
                {temErro: true, mensagemDeErro: "Email inválido. Certifique-se de estar inserindo um email válido."}
        default: return {temErro: false, mensagemDeErro: ""}
    }
}

const formaDePagamentoValida = (ctx) => CARTAO.test(ctx.message.text) || BOLETO.test(ctx.message.text);
const cartao = (ctx) => CARTAO.test(ctx.message.text);
const boleto = (ctx) => BOLETO.test(ctx.message.text);
const silver = (ctx) => PLANO.SILVER.test(ctx.message.text);
const gold = (ctx) => PLANO.GOLD.test(ctx.message.text);
const diamond = (ctx) => PLANO.DIAMOND.test(ctx.message.text);
const blackDiamond = (ctx) => PLANO.BLACK_DIAMOND.test(ctx.message.text);
const confirmado = (ctx) => SIM.test(ctx.message.text);
const negado = (ctx) => NAO.test(ctx.message.text);

export { formaDePagamentoValida, cartao, boleto, confirmado, negado, silver, gold, diamond, blackDiamond, validate }
