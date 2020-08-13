import { BaseScene } from 'telegraf';

const wizard = new BaseScene('analysis')
wizard.enter((ctx) => {
    ctx.reply('Olá!')
    ctx.scene.enter('pegarinfo')
})

export default wizard;