export interface ISubcommand {
    name: string;
    usage: string;
    examples: string[];
    description: string;
}

export interface IHelpData {
    name: string;
    tagline: string;
    emoji: string;
    subcommands: ISubcommand[] & [ISubcommand]
}

export type HelpData = Partial<IHelpData>;
export module CommandModule {
    export declare function execute(...args: discord.ClientEvents['interactionCreate']): unknown;

    declare const command: discord.ApplicationCommandData;
    export default command;

    export const helpInfo: HelpData
}