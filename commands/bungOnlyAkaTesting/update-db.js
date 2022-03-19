const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { scoresaber_url } = require('../../config.json');
module.exports = { // bsno!update-db
	name: 'update-db',
	description: 'Add all ranked diffs to db if they already dont exist',
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
	let rankedMaps = [];
	var doneBool = false;
	var loopCount = 0;
	while (!doneBool) {
		loopCount++;
		console.log(loopCount);
		var apiURL = `${scoresaber_url}api/leaderboards?ranked=true&category=1&page=${loopCount}`;
    	const response = await fetchAndRetryIfNecessary (async () => (
    	    await fetch(apiURL)
    	));
		var jsonRes = await response.json();
		if (loopCount == 0) {
			console.log(jsonRes.metadata.total);
		}
		for (var x = 0; x < jsonRes.leaderboards.length; x++) {
			rankedMaps.push({ id: jsonRes.leaderboards[x].id, hash: jsonRes.leaderboards[x].songHash, topScore: { id: '', name: '', score: 0 }, top10Scores: [] });
		}
		if (rankedMaps.length == jsonRes.metadata.total) break;
	}

	console.log(rankedMaps);
	const database = dbClient.db('scoresaber-NO');
    const collection = database.collection('ranked-songs-leaderboard');
	const filter = {};
	const options = { projection: { _id: 0 } };
    const cursor = collection.find(filter, options);
	var docArr = [];
	if (await cursor.count() === 0) {
		return await insertToDB(message, rankedMaps, dbClient);
	} else if (await cursor.count() === rankedMaps.length) {
		console.log('0 docs updated');
		message.channel.send('0 docs updated');
	} else {
		let tempArr = [];
		await cursor.forEach(cursorSong => {
			tempArr.push(cursorSong);
		})
		rankedMaps.forEach(jsonSong => {
			if (!tempArr.some(song => song['id'] === jsonSong.id)) {
				docArr.push( { id: jsonSong.id, hash: jsonSong.hash, topScore: { id: '', name: '', score: 0 }, top10Scores: [] } );
			}
		});
		return await insertToDB(message, docArr, dbClient);
	}
}

async function insertToDB(message, docArr, dbClient) {
	const database = dbClient.db('scoresaber-NO');
    const collection = database.collection('ranked-songs-leaderboard');
	const options = { ordered: true };
	await collection.insertMany(docArr, options)
		.then(res => {
			console.log(res.insertedCount + ' docs inserted');
    		message.channel.send(res.insertedCount + ' docs inserted');
	})
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