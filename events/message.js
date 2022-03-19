module.exports = {
	name: 'message',
	async execute(message, client, db) {
        const Discord = require('discord.js');
        const { prefix } = require('../config.json');
		if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!message.client.commands.has(commandName)) return;

        const command = message.client.commands.get(commandName)
		|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	    if (!command) return;

        if (command.guildOnly && message.channel.type === 'dm') {
            return message.reply('I can\'t execute that command inside DMs!');
        }
        
        if (command.args && !args.length) {
            let reply = `Error: You didn't provide any arguments!`;
	        return message.channel.send(reply);
        }

        const { cooldowns } = message.client;

        if (!cooldowns.has(command.name)) {
	        cooldowns.set(command.name, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        const date = new Date();
        try {
            console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] - User: ${message.author.username} executed command: ${commandName}!`);
	        command.execute(message, args, client, db);
        } catch (error) {
            console.error(error);
		    message.reply(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] - There was an error trying to execute that command!`);
        }
	},
};