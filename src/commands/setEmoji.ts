import discord from 'discord.js';
import type { HelpData } from '../../types/commands';
import guilds from '../guilds.js';

export default {
    name: 'setemoji',
    description: 'Tell Breadward what emoji to react with',
    dmPermission: false,
    type: discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'emoji',
            description: 'The emoji Breadward should react with',
            type: discord.ApplicationCommandOptionType.String,
            min_length: 1,
            required: true
        }
    ]
} satisfies discord.ChatInputApplicationCommandData

export const helpInfo = {
    name: 'Set Emoji',
    tagline: `'Cuz bread just ain't good 'nuff for you`,
    emoji: '✍️',
    subcommands: [{
        description: 'Tell Breadward what emoji to react with',
        usage: '`/setemoji` `emoji`',
        examples: ['`/setemoji` `emoji:`🍞', '`/setemoji` `emoji:`🎂'],
        name: 'Set Emoji',
    }],
} satisfies HelpData

export async function execute(...args: discord.ClientEvents['interactionCreate']){
    const interaction = args[0];
    if ( !(interaction instanceof discord.CommandInteraction) ) return;
    if ( !interaction.guildId ) return interaction.reply({
        content: 'This command can only be used in a server',
        ephemeral: true,
    });

    const emoji = interaction.options.get('emoji', true).value;
    if (typeof emoji !== 'string' ) return interaction.reply({
        content: `Invalid emoji: ${emoji}`,
        ephemeral: true,
    });

    const [,extractedEmojiArr] = emoji.match(/^\s*(\p{Extended_Pictographic}|\p{Regional_Indicator}{2}|[\d#\*]\uFE0F\u20E3|<(?::\w*)?:\d+>|:\w+:)\s*/u) || [];
    if (!extractedEmojiArr) return interaction.reply({
        content: `Invalid emoji: ${emoji}`,
        ephemeral: true,
    });

    guilds[interaction.guildId]!.emoji = emoji;

    interaction.reply({
        content: `Set emoji to ${guilds[interaction.guildId]!.emoji}`,
        ephemeral: true,
    });
}
