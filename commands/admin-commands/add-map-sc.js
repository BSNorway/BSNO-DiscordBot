const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { scoresaber_url } = require('../../config.json');
module.exports = { // bsno!add-map-sc
	name: 'add-map-sc',
	description: 'Add a map to the weekly songs list. Message structure is !add-map-sc [scoresaber url] [type: acc, mid, speed, funny, tech, balanced]',
	args: true,
	guildOnly: true,
	cooldown: 1,
	async execute(message, args, client, dbClient) {
        if (message.member.roles.cache.some(role => role.name === 'Admin') || message.member.id == '224848109849542656') {
            await doTheThing(message, args, dbClient);
        }   
	},
};

async function doTheThing(message, args, dbClient) {
    if (!args[0] || !args[1] || args[0].substring(0, 8) != 'https://') {
        return message.channel.send('Please provide all arguments!');
    }
    let typeArr = ['acc', 'mid', 'speed', 'funny', 'tech', 'balanced'];
    if (!typeArr.includes(args[1])) {
        return message.channel.send(`${args[1]} is not a valid map type!`);
    }

    const mapInfo = await getScoreSaberInfo(args);
    if (mapInfo == undefined) {
        message.channel.send('Error: Cant reach scoresaber api! Try again later!');
        return;
    }
    var diffLabel = mapInfo.difficulty.difficultyRaw.split('_')[1].toLowerCase();
    var hashCode = mapInfo.songHash;

    var points = 0;
    switch (args[1]) {
        case 'acc':
            points = 10
            break;
        case 'mid':
            points = 10
            break;
        case 'speed':
            points = 10
            break;
        case 'tech':
            points = 10
            break;
        case 'funny':
            points = 5
            break;
        case 'balanced':
            points = 10
            break;
    }
    const database = dbClient.db('scoresaber-NO');
    const collection = database.collection('settings');
	const query = { isCurrentSongs: true };
    const options = { projection: { _id: 0 } };
    const setting = await collection.findOne(query, options);
    if (setting) {
        if (setting.songs.length > 0) {
            for (var i = 0; i < setting.songs.length; i++) {
                if (setting.songs[i].hash == hashCode && setting.songs[i].diff == diffLabel) { // If map hash and diff already exists in the db then cancel
                    return message.channel.send(`A map with hash "${hashCode}" and diff "${diffLabel}" already exists!`);
                }
            }
        }
        let newSongs = setting.songs;
        newSongs.push( { hash: hashCode, diff: diffLabel, type: args[1], points: points, songName: mapInfo.songName } );
        const replacementDoc = {
            isCurrentSongs: true,
            songs: newSongs,
        }
        await collection.replaceOne(query, replacementDoc);
        message.channel.send(`Map added to weekly challenge map pool!`);
    } else {
        return message.channel.send('Something went wrong with contacting the db!');
    }
}

async function getScoreSaberInfo(args) {
    var mapId = args[0].split('/')[4].split('?')[0]; // Gets the mapId out of the url
    try {   
        const response = await fetch(`${scoresaber_url}api/leaderboard/by-id/${mapId}/info`);
        if (response.status == 200) {
            return await response.json();
        }
    } catch (e) {
        console.log('Error: add-map-sc' + await getTime() + '\n');
        console.log(e);
    }
    return undefined;
}

async function getTime() {
	const date = new Date();
	return ` - ${date.getDate() + 1}/${date.getMonth()}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}