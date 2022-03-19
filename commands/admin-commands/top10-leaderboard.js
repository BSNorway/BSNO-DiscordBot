const { MessageEmbed } = require('discord.js');
const { hour } = require('../../timerHelper.json');
module.exports = { // bsno!top10-leaderboard
	name: 'top10-leaderboard',
	description: 'Shows a list of top 10 global score count',
	args: true,
	guildOnly: true,
	cooldown: 1,
	async execute(message, args, client, dbClient) {
        if (message.member.id == '224848109849542656') {
            const channel = client.channels.cache.find(channel => channel.id === args[0]);
            if (channel) {
				message.channel.send(`Top 10 global leaderboard initiated in <#${args[0]}>!`);
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
    let userList = [];
    if (dbArr) {
        let users = [];
        let names = [];
        for (var i = 0; i < dbArr.length; i++) {
            for (var x = 0; x < dbArr[i].top10Scores.length; x++) {
                if (!users.includes(dbArr[i].top10Scores[x].id)) {
                    users.push(dbArr[i].top10Scores[x].id);
                    names.push(dbArr[i].top10Scores[x].name);
                }
            }
        }
        for (var i = 0; i < users.length; i++) {
            const query = { top10Scores: { $elemMatch: { id: users[i] } } };
            const userCursor = collection.find(query, options);
            var dbUserArr = await userCursor.toArray();
            userList.push({ id: users[i], name: names[i], mapCount: dbUserArr.length });
        }
    }
    let sortedUsers = userList.sort(compare)
    const leaderboardEmbed = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('Norway Top 10 Global Leaderboard')
        .setFooter('Updates every hour');
    var num = 0;
    sortedUsers.forEach(user => {
        if (num < 8) {
            leaderboardEmbed.addFields(
                { name: 'Spot:', value: num + 1, inline: true }, 
                { name: 'User:', value: user.name, inline: true }, 
                { name: 'Scores:', value: user.mapCount, inline: true }, 
            );
        } else if (num == 8) return;
        num++;
    });
    channel.send(leaderboardEmbed).then(l1 => {
        setInterval(async function() {
            await updateEmbeds(l1, collection);
        }, hour);
    })
}

async function updateEmbeds(l1, collection) {
    const filter = {};
	const options = { projection: { _id: 0 } };
    const cursor = collection.find(filter, options);
    var dbArr = await cursor.toArray();
    let userList = [];
    if (dbArr) {
        let users = [];
        let names = [];
        for (var i = 0; i < dbArr.length; i++) {
            for (var x = 0; x < dbArr[i].top10Scores.length; x++) {
                if (!users.includes(dbArr[i].top10Scores[x].id)) {
                    users.push(dbArr[i].top10Scores[x].id);
                    names.push(dbArr[i].top10Scores[x].name);
                }
            }
        }
        for (var i = 0; i < users.length; i++) {
            const query = { top10Scores: { $elemMatch: { id: users[i] } } };
            const userCursor = collection.find(query, options);
            var dbUserArr = await userCursor.toArray();
            userList.push({ id: users[i], name: names[i], mapCount: dbUserArr.length });
        }
    }
    let sortedUsers = userList.sort(compare)
    const leaderboardEmbed = new MessageEmbed()
		.setColor('#DC2700')
		.setTitle('Norway Top 10 Global Leaderboard')
        .setFooter('Updates every hour');
    var num = 0;
    sortedUsers.forEach(user => {
        if (num < 8) {
            leaderboardEmbed.addFields(
                { name: 'Spot:', value: num + 1, inline: true }, 
                { name: 'User:', value: user.name, inline: true }, 
                { name: 'Scores:', value: user.mapCount, inline: true }, 
            );
        } else if (num == 8) return;
        num++;
    });
    l1.edit(leaderboardEmbed).then(embed1 => {
    });
}

function compare( a, b ) { // Sorting function
    if ( b.mapCount < a.mapCount ){
      return -1;
    }
    if ( b.mapCount > a.mapCount ){
      return 1;
    }
    return 0;
}