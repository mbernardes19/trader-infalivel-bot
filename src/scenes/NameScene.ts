import { BaseScene } from 'telegraf';

const wizard = new BaseScene('name')
wizard.enter((ctx) => {
    console.log(    ctx.scene.state)
    ctx.reply('Olá!')
})

export default wizard;