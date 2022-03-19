const { token, testing_token, mongodb_uri } = require('./config.json'); // Invite Link: https://discord.com/oauth2/authorize?client_id=&scope=bot&permissions=2147575808
const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const fs = require('fs');
const { MongoClient } = require("mongodb");
const dbClient = new MongoClient(mongodb_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

client.commands = new Collection();
client.cooldowns = new Collection();

const commandFolders = fs.readdirSync(`${__dirname}/commands`);
const eventFiles = fs.readdirSync(`${__dirname}/events`).filter(file => file.endsWith('.js'));

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`${__dirname}/commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`${__dirname}/commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

for (const file of eventFiles) {
	const event = require(`${__dirname}/events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client, dbClient));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client, dbClient));
	}
}

dbClient.connect();
client.login(token);