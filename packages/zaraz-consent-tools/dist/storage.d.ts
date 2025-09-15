import { ConsentPreferences } from './types';
export declare class ConsentStorage {
    private cookieName;
    constructor(cookieName?: string);
    save(consent: ConsentPreferences): void;
    load(): ConsentPreferences | null;
    clear(): void;
    private getCookie;
}
