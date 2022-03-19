const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { scoresaber_url } = require('../../config.json');
module.exports = { // bsno!first-scrape
	name: 'first-scrape',
	description: 'Adds scores to songs in db',
	args: false,
	guildOnly: true,
	cooldown: 1,
	async execute(message, args, client, dbClient) {
        if (message.member.id == '224848109849542656') {
            await doTheThing(message, dbClient);
        }   
	},
};

async function doTheThing(message, dbClient) { 
    var totalDone = 0;
    const database = dbClient.db('scoresaber-NO');
    const collection = database.collection('ranked-songs-leaderboard');
	const filter = {};
	const options = { projection: { _id: 0 } };
    const cursor = collection.find(filter, options);
    var dbArr = await cursor.toArray();
    message.channel.send(`Started getting ${dbArr.length} maps!`);
    for (const song of dbArr) {
        if (song.topScore.id === '') {
            var apiURL = `${scoresaber_url}api/leaderboard/by-id/${song.id}/scores?countries=no`;
            const response = await fetchAndRetryIfNecessary (async () => (
                await fetch(apiURL)
            ));
            const jsonRes = await response.json();
            if (jsonRes.length != 0) {
                var topScore = { id: jsonRes[0].leaderboardPlayerInfo.id, name: jsonRes[0].leaderboardPlayerInfo.name, score: jsonRes[0].modifiedScore };
                await uploadScore(collection, song.id, topScore);
            }
        }
        totalDone++;
        console.log(`${totalDone}/${dbArr.length} done\n`);
        if (totalDone == dbArr.length) {
            console.log('Score collection done!')
            message.channel.send('Score collection done!');
        }
    }
}

async function uploadScore(collection, id, topScore) {
    const query = { id: id };
    const options = { projection: { _id: 0 } };
    const song = await collection.findOne(query, options);
    if (song) {
        const updateDoc = { $set: { topScore: topScore } };
        const result = await collection.updateOne(query, updateDoc);
        console.log(`Updated ${result.modifiedCount} document with uid of ${id}`)
    }
}

//#region Fetch with api limit handeling
async function fetchAndRetryIfNecessary (callAPIFn) {
    const response = await callAPIFn();
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const millisToSleep = getMillisToSleep(retryAfter);
      console.log('retry after :' + millisToSleep);
      await sleep(millisToSleep);
      return fetchAndRetryIfNecessary(callAPIFn);
    }
    return response;
}

function getMillisToSleep (retryHeaderString) {
    let millisToSleep = Math.round(parseFloat(retryHeaderString) * 1000);
    if (isNaN(millisToSleep)) {
      millisToSleep = Math.max(0, new Date(retryHeaderString) - new Date());
    }
    return millisToSleep;
}

function sleep (milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
//#endregion