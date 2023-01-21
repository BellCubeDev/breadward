import discord from 'discord.js';
import { commands } from '../index.js';
import type { HelpData } from '../../types/commands';

export default {
    name: 'help',
    description: 'Provides all the help you could ever want with Breadward',
    dmPermission: true,
    type: discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'command',
            description: '[OPTIONAL] The command you want help with',
            type: discord.ApplicationCommandOptionType.String,
            min_length: 1,
            required: false,
        }
    ]
} satisfies discord.ChatInputApplicationCommandData

export const helpInfo = {
    //tagline: see description
    name: 'Help',
    tagline: 'Yeah, go ahead, admit that you need help, punk.',
    subcommands: [{
        name: 'Help',
        description: 'Gives a list of all commands and provides information about their usage',
        usage: '`/help` `[command]`',
        examples: ['`/help`', '`/help` `command:`recurse'],
    }],
    emoji: '🔖'
} satisfies HelpData

export async function execute(...args: discord.ClientEvents['interactionCreate']){
    const interaction = args[0];
    if ( !(interaction instanceof discord.CommandInteraction) ) return;

    const cmdStr = interaction.options.get('command')?.value;
    if (cmdStr && typeof cmdStr === 'string') {
        return interaction.reply({content: 'Fetching command...', ephemeral: true})
                          .then(()=> interaction.editReply(createCommandReply(cmdStr)) );
    }

    const commandList = [...commands].map(([name, [file, command, helpInfo]]):discord.SelectMenuComponentOptionData => {
        return {
            label: helpInfo.name || name,
            description: helpInfo?.tagline ?? ('description' in command ? command.description : '') ?? '',
            value: name,
            emoji: helpInfo?.emoji ?? '',
        };
    });

    const dropdown = new discord.ActionRowBuilder<discord.StringSelectMenuBuilder>().addComponents(
        new discord.StringSelectMenuBuilder()
            .setCustomId('dropdown')
            .addOptions(commandList)
            .setPlaceholder('Select a command')
    )

    const cancelButton = new discord.ActionRowBuilder<discord.ButtonBuilder>().addComponents(
        new discord.ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(discord.ButtonStyle.Secondary)
    )

    const reply = await interaction.reply({
        ephemeral: true,
        content: '',
        embeds: [{
            color: 0x40ff40,
            title: 'Help',
            description: 'Select a command to get more information about it',
            timestamp: new Date().toISOString(),
        }],
        components: [dropdown, cancelButton],
    });

    const canceledEmbed = {
        embeds: [{
            color: 0xffff80,
            title: 'Help',
            description: 'Help cancelled',
            timestamp: new Date().toISOString(),
        }],
        components: [],
    }

    const collector = (interaction?: discord.MessageComponentInteraction<discord.CacheType>) => {
        if ( !(interaction instanceof discord.MessageComponentInteraction) ) return;

        if (interaction.customId === 'cancel'){
            interaction.update(canceledEmbed);
            return;
        }

        if ( interaction.customId !== 'dropdown' || !(interaction instanceof discord.StringSelectMenuInteraction) ) {
            interaction.update({content: 'Unknown Component ID or Interaction Type', components: []});
            console.log('Unknown Component ID or Interaction Type', interaction);
            return;
        }

        interaction.update(createCommandReply(interaction.values[0] ?? ''));
    }

    reply.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === interaction.user.id,
        time: 60000,
    })
    .on('ignore',  collector)
    .on('dispose', collector)
    .on('collect', collector)
    .on('end', (collected, reason) => {
        if (reason === 'time') interaction.editReply(canceledEmbed);
        console.log('Help collector ended', collected, reason);
    });
}

function createCommandReply(cmd: string): discord.InteractionUpdateOptions {
    cmd = cmd.toLowerCase();
    const command = commands.get(cmd);
        if (!command) {
            console.log(`Command "${cmd}" not found`);
            return {content: `Command "${cmd}" not found`, components: []};
        };

        const [file, commandData, helpInfo] = command;
        return {
            content: helpInfo.tagline || '',
            embeds: helpInfo.subcommands?.map((subcommand):discord.APIEmbed => { return{
                color: 0x4040ff,
                title: subcommand.name,
                description: subcommand.description,
                fields: [
                    {name: 'Usage', value: subcommand.usage || '', inline: true},
                    {name: 'Examples', value: subcommand.examples?.join('\n') || '', inline: true},
                ],
                timestamp: new Date().toISOString(),
            }}) ?? [],
            components: [],
        };
}
