import discord from 'discord.js';
import type { HelpData } from '../../types/commands';
import {reactToMessage} from '../index.js'

export default {
    name: 'recurse',
    description: 'Instruct Breadward to react to every message in this channel',
    dmPermission: true,
    type: discord.ApplicationCommandType.ChatInput,
} satisfies discord.ChatInputApplicationCommandData

export const helpInfo = {
    name: 'Recurse',
    tagline: 'REACT TO IT ALL!!!',
    subcommands: [{
        name: 'Recurse',
        description: 'Instruct Breadward to react to every message in the history of this channel',
        usage: '`/recurse`',
        examples: ['`/recurse`'],
    }],
    emoji: '🔎'
} satisfies HelpData

export async function execute(...args: discord.ClientEvents['interactionCreate']){
    const interaction = args[0];
    if ( !(interaction instanceof discord.CommandInteraction) ) return;

    interaction.reply({
        content: 'Brewdward will do as you wish!',
        ephemeral: true,
    });

    const messages = await interaction.channel?.messages.fetch();
    for (const message of messages?.values() || [])
        reactToMessage(message, true)
}
