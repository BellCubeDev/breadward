import discord from 'discord.js';
import type { HelpData } from '../../types/commands';
import guilds from '../guilds.js';

export default {
    name: 'enable',
    description: 'Enable Breadward in this server',
    dmPermission: false,
    type: discord.ApplicationCommandType.ChatInput,
} satisfies discord.ChatInputApplicationCommandData

export const helpInfo = {
    name: 'Enable',
    tagline: 'But why would I ever be disabled?',
    subcommands: [{
        name: 'Enable',
        description: 'Enable Breadward in this server',
        usage: '`/enable`',
        examples: ['`/enable`'],
    }],
    emoji: '✅'
} satisfies HelpData

export async function execute(...args: discord.ClientEvents['interactionCreate']){
    const interaction = args[0];
    if ( !(interaction instanceof discord.CommandInteraction) ) return;

    if ( !interaction.guildId ) return interaction.reply({
        content: 'This command can only be used in a server',
        ephemeral: true,
    });

    if ( !guilds[interaction.guildId]!.disabled ) return interaction.reply({
        content: `But I'm *already* being mischievous!`,
        ephemeral: true,
    });

    guilds[interaction.guildId]!.disabled = false;

    interaction.reply({
        content: `Back to mischief!`,
        ephemeral: true,
    });
}
