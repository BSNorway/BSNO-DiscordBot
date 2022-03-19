const { MessageEmbed } = require('discord.js');
const { prefix } = require('../../config.json');
module.exports = { // bsno!help
	name: 'help',
	description: 'List all commands or info about a specific command.',
	cooldown: 1,
	async execute(message, args) {
        if (message.member.id == '224848109849542656' && args[0] === '2') {
            return await doTheThingNotAdmin(message);
        }
		if (message.member.roles.cache.some(role => role.name === 'Admin') || message.member.id == '224848109849542656') {
            await doTheThing(message);
        } else {
            await doTheThingNotAdmin(message);
        }
	},
};

async function doTheThing(message) {
    const helpEmbed = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('Bot Help Admin')
        .addFields(
                { name: `${prefix}add-map [hashcode] [diff: easy, normal, hard, expert, expertplus] [type: acc, mid, speed, funny, tech, balanced]`, value: 'Add a map to the weekly songs pool.' }, 
                { name: `${prefix}add-map-sc [scoresaber url] [type: acc, mid, speed, funny, tech, balanced]`, value: 'Add a map to the weekly songs pool.' }, 
                { name: `${prefix}empty-map-pool`, value: 'Empties the map pool.' }, 
        );
    message.channel.send(helpEmbed);
}

async function doTheThingNotAdmin(message) {
    const helpEmbed = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('Bot Help')
        .addFields(
                { name: `${prefix}playlist [type: no1, top10] [scoresaber id]`, value: 'Make a playlist with funny songs from a player' }, 
        );
    message.channel.send(helpEmbed);
}