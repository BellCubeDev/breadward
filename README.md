# Breadward

Breadward is a Discord bot built in Node.js using the Discord.js library. Its one and only purpose is to react to every message with a bread emoji. It's a simple bot, but it serves a very important purpose. More configurable than it has any right to be, Breadward is the perfect bot for your server.

## Slash Commands

Breadward has slash commands! Use `/help` to get a list of all the commands, or `/help [command]` to get more information about a specific command. For ease-of-maintainence purposes, I will not be listing all of the commands here. If you really want to know what they are, you can look in the [`src/commands`](src/commands/) directory.

## Building

To build Breadward, you will need to have Node.js and NPM installed. Once you have those, run `npm install` to install all of the dependencies. Then, run `npm run build` to build the bot. The built bot will be in the `instance/` directory.

## Running

To run Breadward, you will need to have Node.js and NPM installed.
1. Follow the build steps above.
2. Do one of the folling:
    1. Set the environment variable "TOKEN" to your bot instance's token
    2. Create a file called "token.txt" in the project root and put your bot instance's token in it
    2. Provide the token as an additional argument whenever you run the bot
    4. Provide the token at runtime via STDIN (typing it into the terminal, for example)
3. Run `npm start` to start the bot.
