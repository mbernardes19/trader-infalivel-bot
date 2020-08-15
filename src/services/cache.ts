import NodeCache from 'node-cache';

export default class CacheService {
    private static cache = new NodeCache();

    static saveUserData(key: string, value: any) {
        this.save(key, value);
    }

    private static save(key: string, value: any) {
        this.cache.set(key, value);
    }

    static get<T>(key: string) {
        return this.cache.get<T>(key);
    }

    static showAllKeys() {
        return this.cache.keys()
    }

}