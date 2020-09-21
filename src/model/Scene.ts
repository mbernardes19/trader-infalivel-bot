import { BaseScene, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage";
import CacheService from "../services/cache";
import { log } from '../logger';
import { ActionFunction } from "../interfaces/ActionFunction";
import Keyboard from "./Keyboard";

export default class Scene extends BaseScene<SceneContextMessageUpdate> {

    constructor(id: string) {
        super(id);
        this.addDefaultCommands();
    }

    private addDefaultCommands() {
        this.command('reiniciar', ctx => {
            log(`Reiniciando bot por ${ctx.chat.id}`)
            CacheService.clearAllUserData()
            return ctx.scene.enter('welcome')
        })
        this.command('parar', async ctx => {
            log(`Parando bot por ${ctx.chat.id}`)
            CacheService.clearAllUserData()
            return await ctx.scene.leave()
        })
        this.command('suporte', async ctx => {
            log(`Enviando suporte para ${ctx.chat.id}`)
            await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(Keyboard.SUPPORT))
            CacheService.clearAllUserData()
            return await ctx.scene.leave()
        })
    }

    onEnter(actionFn: ActionFunction) {
        this.enter(actionFn);
    }

    onAction(action: string, actionFn: ActionFunction) {
        this.action(action, async (ctx) => {
            await ctx.answerCbQuery();
            await actionFn(ctx)
        });
    }

    onUse(actionFn: ActionFunction) {
        this.use(actionFn);
    }

}