import discord from 'discord.js';
import type { HelpData } from '../../types/commands';
import guilds from '../guilds.js';

export default {
    name: 'disable',
    description: 'Disable Breadward in this server',
    dmPermission: false,
    type: discord.ApplicationCommandType.ChatInput,
} satisfies discord.ChatInputApplicationCommandData

export const helpInfo = {
    name: 'Disable',
    tagline: 'Why would you want to, though?',
    subcommands: [{
        name: 'Disable',
        description: 'Disable Breadward in this server',
        usage: '`/disable`',
        examples: ['`/disable`'],
    }],
    emoji: '🚫'
} satisfies HelpData

export async function execute(...args: discord.ClientEvents['interactionCreate']){
    const interaction = args[0];
    if ( !(interaction instanceof discord.CommandInteraction) ) return;

    if ( !interaction.guildId ) return interaction.reply({
        content: 'This command can only be used in a server',
        ephemeral: true,
    });

    if ( guilds[interaction.guildId]!.disabled ) return interaction.reply({
        content: `You can stop now, I'm already quiet...`,
        ephemeral: true,
    });

    guilds[interaction.guildId]!.disabled = true;

    interaction.reply({
        content: `Alright, I'll be quiet now...`,
        ephemeral: true,
    });
}
