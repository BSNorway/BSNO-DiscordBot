const { MessageEmbed } = require('discord.js');
module.exports = { // bsno!top-leaderboard
	name: 'top-leaderboard',
	description: 'Shows a list of top 50 scores',
	args: true,
	guildOnly: true,
	cooldown: 1,
	async execute(message, args, client, dbClient) {// Change from discord embeds to image embeds served from a webserver
        if (message.member.roles.cache.some(role => role.name === 'Admin') || message.member.id == '224848109849542656') {
            const channel = client.channels.cache.find(channel => channel.id === args[0]);
            if (channel) {
				message.channel.send(`#1 Norway leaderboard initiated in <#${args[0]}>!`);
				await doTheThing(channel, dbClient); // Main function
			} else {
				message.channel.send('Error: Invalid channel id!');
			}
        }   
	},
};

async function doTheThing(channel, dbClient) {
    const database = dbClient.db('scoresaber-NO');
    const collection = database.collection('ranked-songs-leaderboard');
	const filter = {};
	const options = { projection: { _id: 0 } };
    const cursor = collection.find(filter, options);
    var dbArr = await cursor.toArray();
    let users = [];
    for (const song of dbArr) {
        if (song.topScore.id != '') {
            users.push(song.topScore);
        }
    }
    let sortedUsers = users.sort(compare);
    let newUsers = [];
    let userObj = {id: sortedUsers[0].id, name: sortedUsers[0].name, scoreCount: 0 };
    for (var i = 0; i < sortedUsers.length - 1; i++) {
        userObj.scoreCount += 1;
        if (i == sortedUsers.length - 2) {
            userObj.scoreCount += 1;
            newUsers.push(userObj);
            userObj = { id: sortedUsers[i].id, name: sortedUsers[i].name, scoreCount: 0 };
        } else if (sortedUsers[i].id != sortedUsers[i + 1].id) {
            newUsers.push(userObj);
            userObj = { id: sortedUsers[i + 1].id, name: sortedUsers[i + 1].name, scoreCount: 0 };
        }
    }
    let sortedNewUsers = newUsers.sort(compareNew);
    const leaderboardEmbed1 = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('#1 Norway Leaderboard')
    const leaderboardEmbed2 = new MessageEmbed()
	    .setColor('#DC2700')
        .setFooter('Updates every hour');
    var num = 0;
    sortedNewUsers.forEach(user => {
        if (num < 8) {
            leaderboardEmbed1.addFields(
                { name: 'Spot:', value: num + 1, inline: true }, 
                { name: 'User:', value: user.name, inline: true }, 
                { name: 'Scores:', value: user.scoreCount, inline: true }, 
            );
        } else if (num > 7 && num < 16) {
            leaderboardEmbed2.addFields(
                { name: 'Spot:', value: num + 1, inline: true }, 
                { name: 'User:', value: user.name, inline: true }, 
                { name: 'Scores:', value: user.scoreCount, inline: true }, 
            );
        } else if (num == 16) return;
        num++;
    });
    channel.send(leaderboardEmbed1).then(l1 => {
        channel.send(leaderboardEmbed2).then(l2 => {
            setInterval(async function() {
				await updateEmbeds(l1, l2, collection);			
			}, 3600000); // 3600000 ms is 60 mins
        })
    })
}

async function updateEmbeds(l1, l2, collection) {
	const filter = {};
	const options = { projection: { _id: 0 } };
    const cursor = collection.find(filter, options);
    var dbArr = await cursor.toArray();
    let users = [];
    for (const song of dbArr) {
        if (song.topScore.id != '') {
            users.push(song.topScore);
        }
    }
    let sortedUsers = users.sort(compare);
    let newUsers = [];
    let userObj = {id: sortedUsers[0].id, name: sortedUsers[0].name, scoreCount: 0 };
    for (var i = 0; i < sortedUsers.length - 1; i++) {
        userObj.scoreCount += 1;
        if (i == sortedUsers.length - 2) {
            userObj.scoreCount += 1;
            newUsers.push(userObj);
            userObj = { id: sortedUsers[i].id, name: sortedUsers[i].name, scoreCount: 0 };
        } else if (sortedUsers[i].id != sortedUsers[i + 1].id) {
            newUsers.push(userObj);
            userObj = { id: sortedUsers[i + 1].id, name: sortedUsers[i + 1].name, scoreCount: 0 };
        }
    }
    let sortedNewUsers = newUsers.sort(compareNew);
    const leaderboardEmbed1 = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('#1 Norway Leaderboard')
    const leaderboardEmbed2 = new MessageEmbed()
	    .setColor('#DC2700')
        .setFooter('Updates every hour');
    var num = 0;
    sortedNewUsers.forEach(user => {
        if (num < 8) {
            leaderboardEmbed1.addFields(
                { name: 'Spot:', value: num + 1, inline: true }, 
                { name: 'User:', value: user.name, inline: true }, 
                { name: 'Scores:', value: user.scoreCount, inline: true }, 
            );
        } else if (num > 7 && num < 16) {
            leaderboardEmbed2.addFields(
                { name: 'Spot:', value: num + 1, inline: true }, 
                { name: 'User:', value: user.name, inline: true }, 
                { name: 'Scores:', value: user.scoreCount, inline: true }, 
            );
        } else if (num == 16) return;
        num++;
    });
    l1.edit(leaderboardEmbed1).then(embed1 => {
		l2.edit(leaderboardEmbed2);
	});
}

function compare( a, b ) { // Sorting function
    if ( b.id < a.id ){
      return -1;
    }
    if ( b.id > a.id ){
      return 1;
    }
    return 0;
}

function compareNew( a, b ) { // Sorting function
    if ( b.scoreCount < a.scoreCount ){
      return -1;
    }
    if ( b.scoreCount > a.scoreCount ){
      return 1;
    }
    return 0;
}