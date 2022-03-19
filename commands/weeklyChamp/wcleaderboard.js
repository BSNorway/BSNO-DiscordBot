const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { MessageEmbed } = require('discord.js');
const { minute } = require('../../timerHelper.json');

module.exports = { // bsno!wcleaderboard
	name: 'wcleaderboard',
	description: 'Enables weekly champ leaderboards in the channel',
	aliases: [''],
	args: true,
	guildOnly: true,
	cooldown: 1,
	async execute(message, args, client) {
		if (message.member.roles.cache.some(role => role.name === 'Admin') || message.member.id == '224848109849542656') { 
			const channel = client.channels.cache.find(channel => channel.id === args[0]);
			if (channel) {
				message.channel.send(`Weekly Champ leaderboards initiated in <#${args[0]}>!`);
				await doTheThing(channel);
			} else {
				message.channel.send('Error: Invalid channel id!');
			}
        }   
	},
};

async function doTheThing(channel) {
	try {
		const top25Embed = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('Top 25')
		.setFooter('Updates every 30 mins.');
		const top26Embed = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('Top 26+')
		.setFooter('Updates every 30 mins.');
		await fetch('https://bsno-wc.herokuapp.com/api/v2/getTop25UsersPoints')
    	.then(res => res.json())
		.then(json => {
			var num = 0;
    	    json.users.forEach(user => {
				if (num == 8) return;
				num++;
				top25Embed.addFields(
					{ name: 'Spot:', value: num + '#', inline: true }, 
					{ name: 'User:', value: user.username, inline: true }, 
					{ name: 'WP:', value: user.WP, inline: true }, 
				);
			});
    	});
		await fetch('https://bsno-wc.herokuapp.com/api/v2/getTop26UsersPoints')
    	.then(res => res.json())
		.then(json => {
			var num = 0;
    	    json.users.forEach(user => {
				if (num == 8) return;
				num++;
				top26Embed.addFields(
					{ name: 'Spot:', value: num + '#', inline: true }, 
					{ name: 'User:', value: user.username, inline: true }, 
					{ name: 'WP:', value: user.WP, inline: true }, 
				);
			});
    	});
		channel.send(top25Embed).then(top25 => {
			channel.send(top26Embed).then(top26 => {
				setInterval(async function() {
					await updateTopEmbeds(top25, top26);
				}, minute * 30); 
			});
		});
		} catch (e) {
			console.log(e);
		}
}

async function updateTopEmbeds(top25, top26) {
	try {
		const top25Embed = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('Top 25')
		.setFooter('Updates every 30 mins.');
		const top26Embed = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('Top 26+')
		.setFooter('Updates every 30 mins.');
		await fetch('https://bsno-wc.herokuapp.com/api/v2/getTop25UsersPoints')
    	.then(res => res.json())
		.then(json => {
			var num = 0;
    	    json.users.forEach(user => {
				if (num == 8) return;
				num++;
				top25Embed.addFields(
					{ name: 'Spot:', value: num + '#', inline: true }, 
					{ name: 'User:', value: user.username, inline: true }, 
					{ name: 'WP:', value: user.WP, inline: true }, 
				);
			});
    	});
		await fetch('https://bsno-wc.herokuapp.com/api/v2/getTop26UsersPoints')
    	.then(res => res.json())
		.then(json => {
			var num = 0;
    	    json.users.forEach(user => {
				if (num == 8) return;
				num++;
				top26Embed.addFields(
					{ name: 'Spot:', value: num + '#', inline: true }, 
					{ name: 'User:', value: user.username, inline: true }, 
					{ name: 'WP:', value: user.WP, inline: true }, 
				);
			});
    	});

		top25.edit(top25Embed).then(msg25 => {
			top26.edit(top26Embed);
		});
	} catch (e) {
		console.log(e);
	}
}