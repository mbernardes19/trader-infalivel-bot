import { Context } from 'telegraf'
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

type ActionFunction = (ctx: SceneContextMessageUpdate) => void;

export { ActionFunction }