/** Main entrypoint for the bot
 * * Retrieves the token and logs the bot in
 * * Registers slash commands
 * * Listens for interactions
 * * Reacts with bread
 */

export let stdoutContents = '';
// Capture STDOUT and STDERR while still writing them to the console

// @ts-ignore - this all works, don't question it
process.stdout.write = ((write) => function (string: string, encoding: BufferEncoding, fd: number) {
    const isoStr = `[${new Date().toISOString()}] ${string}`
    stdoutContents += isoStr;

    // @ts-ignore - this all works, don't question it
    return write.apply(process.stdout, [isoStr, encoding, fd]);
}
)(process.stdout.write);

// @ts-ignore - this all works, don't question it
process.stderr.write = ((write) => function (string: string, encoding: BufferEncoding, fd: number) {
    const isoStr = `[${new Date().toISOString()}] ${string}`
    stdoutContents += isoStr;

    // @ts-ignore - this all works, don't question it
    return write.apply(process.stderr, [isoStr, encoding, fd]);
})(process.stderr.write);

import discord from 'discord.js';
import fs from 'fs/promises';

import envFile from './env.json' assert { type: 'json' };

import guilds from './guilds.js';

import type {CommandModule, HelpData} from '../types/commands';

import './httpServer.js';

// use envFile as the environment default - variables set in the environment will override these
process.env = { ...envFile, ...process.env };

export function baseJSONStringifyFunct(key: string, value: unknown) {
    if (typeof value === 'bigint') return value.toString();

    if (value instanceof Map) return [...value.entries()];
    if (value instanceof Set) return [...value.values()];

    if (value instanceof Error || typeof value === 'function') return Object.getOwnPropertyNames(value).reduce((error, key) => {
        error[key] = value[key as keyof typeof value];
        return error;
    }, {} as Record<string, unknown>);

    if (value
        && (typeof value === 'object' || typeof value === 'function')
        && 'toJSON' in value
        && typeof value.toJSON === 'function'
    ) return value.toJSON();

    return value;
}

function requestToken(): Promise<string> {
    return new Promise((resolve, reject) => {
        process.stdin.setEncoding('utf8');
        process.stdin.resume();
        console.log('Enter the bot token:');
        process.stdin.on('data', (data) => {
            process.env['TOKEN'] = data.toString().trim();
            process.stdin.destroy();
            resolve(process.env['TOKEN']);
        });
        process.stdin.on('error', (err) => {
            reject(err);
        });
    });
}

const token_ = process.env['TOKEN'] || process.argv[2];
if (!token_) {
    await fs.readFile('../token.txt', 'utf8').then((token) => process.env['TOKEN'] = token.trim())
        .catch(async () => requestToken());
}

const token  = process.env['TOKEN'] || process.argv[2];
if (!token) throw new Error('No token provided');

const client = new discord.Client({
    intents:[
            "Guilds",
            "GuildMessages",
            "GuildMessageReactions",
            "GuildMessageTyping",
            "DirectMessages",
            "DirectMessageReactions",
            "DirectMessageTyping"
        ],
});



export const commands = new Map<string, [string, discord.ApplicationCommandData, Partial<HelpData>]>();
const rawCommandsData: discord.ApplicationCommandData[] = []

client.on('ready', async (client) => {
    console.log('Logged in!');

    // Register new slash command for each file in ./commands/
    for (const file of await fs.readdir('./commands/')) {
        if (!file.endsWith('.js')) continue;
        const command = await import(`./commands/${file}`) as typeof CommandModule;

        rawCommandsData.push(command.default);
        commands.set(command.default.name, [file, command.default, command.helpInfo]);
    }

    client.application.commands.set(rawCommandsData);
});


client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isCommand()) return;
        const command = await import(`./commands/${commands.get(interaction.commandName)?.[0]}`);
        command.execute(interaction);
    } catch (error) {
        if (error instanceof TypeError && error.message === 'command.execute is not a function') {
            console.error('Interaction failed - NOT IMPLEMENTED YET: ', {interaction, error});
            if (interaction instanceof discord.CommandInteraction)
                interaction.reply({
                    content: 'This command is not implemented yet.',
                    ephemeral: true,
                });
            return;
        }
        console.error('Interaction failed: ', {interaction, error});
        if (interaction instanceof discord.CommandInteraction)
            interaction.reply({
                content: 'An error occurred while executing this command!',
                ephemeral: true,
                embeds: [
                    {
                        title: 'Interaction Data',
                        description: `\`\`\`json\n${JSON.stringify(interaction, baseJSONStringifyFunct, 4)}\n\`\`\``,
                    },
                    {
                        title: 'Error Data',
                        description: `\`\`\`json\n${JSON.stringify(error, baseJSONStringifyFunct, 4)}\n\`\`\``,
                    },
                ]
            });
    }
});

// react to all new messages with a bread emoji
client.on('messageCreate', reactToMessage);

export async function reactToMessage(message: discord.Message<boolean>, force: boolean = false) {
    try {
        let emoji = '🍞';

        if (message.guildId){
            if (!force && guilds[message.guildId]!.disabled) return;
            emoji = guilds[message.guildId]!.emoji ?? emoji;
        }

        let noReact = false;
        const reactions = message.reactions.valueOf()
        for (const [rEmoji, reaction] of reactions) {
            if (rEmoji === emoji) {
                if (reaction.me) noReact = true;

                // We won't need to remove any reactions, so we can skip the rest of this iteration
                continue;
            }

            // Remove the bot's reactions to other emojis
            if (reaction.me) {
                reaction.users.remove(client.user!)
            };
        }

        if (noReact) return;
        await message.react(emoji);
    } catch (error) {
        if (error instanceof discord.DiscordAPIError && error.code === 10008) return;
        console.error('Error reacting to message: ', {message, error});
    }
}

client.login(token);
