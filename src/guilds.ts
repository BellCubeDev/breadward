/** Manages guild configurations by storing a JSON file for each guild.
 *  Updates JSON files when values are changed using Proxy objects.
 */

import fs from 'fs/promises';

export interface GuildConfig{
    disabled: boolean;
    emoji: string;
}
export type GuildConfigs = Record<string, Partial<GuildConfig>>

function makeDeepSaveProxy<t extends object>(target: t, guild: string, guildRef: object): t {
    return new Proxy(target, {
        set: (target, key, value) => {
            if (value && typeof value === 'object')
                value = makeDeepSaveProxy(value, guild, guildRef);

            target[key as keyof t] = value;

            fs.writeFile(`./db/${guild}.json`, JSON.stringify(guildRef, null, 4)).catch(console.error);
            return true;
        }
    });
}

if (await fs.access('./db/').catch(() => true)) await fs.mkdir('./db/');

const db_raw = {} as GuildConfigs;
for (const file of await fs.readdir('./db/')) {
    if (!file.endsWith('.json')) continue;
    const guildId = file.slice(0, -5);
    const tempGuild = (await import(`./db/${file}`, { assert: { type: 'json' }})).default as GuildConfig;
    db_raw[guildId] = makeDeepSaveProxy(tempGuild, guildId, tempGuild);
}

const guilds = new Proxy(db_raw, {
    get: (target, guild) => {
        if (typeof guild !== 'string') return {};

        if (target[guild]) return target[guild];

        const tempObj = {} as GuildConfig;
        return target[guild] ??= makeDeepSaveProxy(tempObj, guild, tempObj);
    },
    set: (target, guild, value) => {
        if (typeof guild !== 'string') return false;
        target[guild] = value;
        fs.writeFile(`./db/${guild}.json`, JSON.stringify(value, null, 4)).catch(console.error);
        return true;
    },
});

export default guilds;
