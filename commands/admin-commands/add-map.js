const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
module.exports = { // !add-map 5C3F33B42A75F08C5672119F7CDAC3A66EC630C6 hard acc
	name: 'add-map',
	description: 'Add a map to the weekly songs list. Message structure is !add-map [hashcode] [diff: easy, normal, hard, expert, expertplus] [type: acc, mid, speed, funny, tech, balanced]',
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
    if (!args[0] || !args[1] || !args[2]) {
        return message.channel.send('Please provide all arguments!');
    }
    let diffArr = ['easy', 'normal', 'hard', 'expert', 'expertplus'];
    let typeArr = ['acc', 'mid', 'speed', 'funny', 'tech'];
    if (!diffArr.includes(args[1])) {
        return message.channel.send(`${args[1]} is not a valid map diff!`);
    }
    if (!typeArr.includes(args[2])) {
        return message.channel.send(`${args[2]} is not a valid map type!`);
    }

    // Beatsaver get request to get the song name and check if the hash is correct
    const response = await fetch(`https://api.beatsaver.com/maps/hash/${args[0]}`);
    const jsonRes =  await response.json();
    if (jsonRes.error == 'Not Found') {
        return message.channel.send('Please provide a valid map hash!');
    }
    
    var points = 0;
    switch (args[2]) {
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
                if (setting.songs[i].hash == args[0] && setting.songs[i].diff == args[1]) { // If map hash and diff already exists in the db then cancel
                    return message.channel.send(`A map with hash "${args[0]}" and diff "${args[1]}" already exists!`);
                }
            }
        }
        let newSongs = setting.songs;
        newSongs.push( { hash: args[0], diff: args[1], type: args[2], points: points, songName: jsonRes.metadata.songName, coverUrl: jsonRes.versions[0].coverURL } );
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