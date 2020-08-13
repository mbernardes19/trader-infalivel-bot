import NodeCache from 'node-cache';
import { TelegrafContext } from 'telegraf/typings/context';

export default class CacheService {
    private static cache = new NodeCache();

    static saveUserData(ctx: TelegrafContext, key: string, value: any) {
        this.save(key, value);
    }

    private static save(key: string, value: any) {
        this.cache.set(key, value);
    }

    static get<T>(key: string) {
        return this.cache.get<T>(key);
    }

}