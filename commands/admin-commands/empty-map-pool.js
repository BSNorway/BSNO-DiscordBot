module.exports = { // !empty-map-pool
	name: 'empty-map-pool',
	description: 'Empties the map pool',
	args: false,
	guildOnly: true,
	cooldown: 1,
	async execute(message, args, client, dbClient) {
        if (message.member.roles.cache.some(role => role.name === 'Admin') || message.member.id == '224848109849542656') {
            await doTheThing(message, dbClient);
        }   
	},
};

async function doTheThing(message, dbClient) {
	const database = dbClient.db('scoresaber-NO');
    const collection = database.collection('settings');
	const query = { isCurrentSongs: true };
    const options = { projection: { _id: 0 } };
    const setting = await collection.findOne(query, options);
    if (setting) {
        await collection.replaceOne(query, { isCurrentSongs: true, songs: [] });
        message.channel.send(`Map pool successfully emptied!`);
    } else {
        return message.channel.send('Something went wrong with contacting the db!');
    }
}