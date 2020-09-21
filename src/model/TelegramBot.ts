import Telegraf, { Context } from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import { ActionFunction } from "../interfaces/ActionFunction";

export default class TelegramBot {
    private _bot: Telegraf<TelegrafContext>;

    constructor(bot: Telegraf<TelegrafContext>) {
        this._bot = bot;
    }

    addCommand(command: string, actionFn: ActionFunction) {
        this._bot.command(command, actionFn);
    }

    onMessage(actionFn: ActionFunction) {
        this._bot.on('message', actionFn);
    }

    launch() {
        this._bot.launch();
    }

    getBot() {
        return this._bot;
    }
}