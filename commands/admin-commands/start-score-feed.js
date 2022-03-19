const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { minute, hour } = require('../../timerHelper.json');
const { scoresaber_url } = require('../../config.json');
module.exports = { // bsno!start-score-feed
	name: 'start-score-feed',
	description: 'Starts the score feed',
	args: true,
	guildOnly: true,
	cooldown: 1,
	async execute(message, args, client, dbClient) {
        if (message.member.id == '224848109849542656') {
			const channel = client.channels.cache.find(channel => channel.id === args[0]);
			if (channel) {
				message.channel.send(`Score feed initiated in <#${args[0]}>!`);
				await updateRankedMapsInDB(dbClient);
				console.log(`${await getTime()}Ranked maps update done!`)
				await doTheThing(channel, dbClient);
				console.log(await getTime() + 'First start-score-feed cycle done!');
				setInterval(async () => {
					await updateRankedMapsInDB(dbClient);
					console.log(`${await getTime()}Ranked maps update done!`)
					await doTheThing(channel, dbClient);
					console.log(await getTime() + 'One start-score-feed cycle done!');
				}, hour)
			} else {
				message.channel.send(await getTime() + 'Error: Invalid channel id!');
			}
        }   
	},
};

async function doTheThing(message, dbClient) {
    const database = dbClient.db('scoresaber-NO');
    const collection = database.collection('ranked-songs-leaderboard');
	const filter = {};
	const options = { projection: { _id: 0 } };
    const cursor = collection.find(filter, options);
    var dbArr = await cursor.toArray();
    for (const song of dbArr) {
		await nr1NorwayThing(message, collection, song);
		await top10GlobalThing(message, collection, song);
	}
}

async function nr1NorwayThing(message, collection, song) {
	try {
		var apiURL = `${scoresaber_url}api/leaderboard/by-id/${song.id}/scores?countries=no`;
    	const response = await fetchAndRetryIfNecessary (async () => (
    	    await fetch(apiURL)
    	));
		if (response.status === 200) {
			const jsonRes = await response.json();
			if (jsonRes.scores.length != 0) {
				var topScore = { id: jsonRes.scores[0].leaderboardPlayerInfo.id, name: jsonRes.scores[0].leaderboardPlayerInfo.name, score: jsonRes.scores[0].modifiedScore };
				const query = { id: song.id };
    			if (song.topScore.id == topScore.id && song.topScore.score != topScore.score) { // If the current #1 score is different than the new one
					const updateDoc = { $set: { topScore: topScore } };
					await collection.updateOne(query, updateDoc);
				} else if (song.topScore.id != topScore.id) {
					const updateDoc = { $set: { topScore: topScore } };
					await collection.updateOne(query, updateDoc);
					message.send(`https://scoresaber.com/u/${topScore.id} har tatt #1 Norge på: https://scoresaber.com/leaderboard/${song.id}`);
				}
			}
		} else {
			return;
		}
	} catch (e) {
		console.log(await getTime() + e + 'Error: nr1NorwayThing' + '\n');
	}
	
}

async function top10GlobalThing(message, collection, song) {
	try {
		var apiURL = `${scoresaber_url}api/leaderboard/by-id/${song.id}/scores`;
    	const response = await fetchAndRetryIfNecessary (async () => (
    	    await fetch(apiURL)
    	));
		if (response.status === 200) {
			const jsonRes = await response.json();
			if (jsonRes.scores.length != 0) {
				let norwegianScores = [];
				for (var i = 0; i < 10; i++) {
					if (jsonRes.scores[i].leaderboardPlayerInfo.country === 'NO') {
						norwegianScores.push({ id: jsonRes.scores[i].leaderboardPlayerInfo.id, name: jsonRes.scores[i].leaderboardPlayerInfo.name });
					}
				}

				try {
					if (norwegianScores.length > 0 || song.top10Scores.length > 0) { // Checks if there is a need to run further checks
						if (norwegianScores.length === 0 && song.top10Scores.length > 0) { // If new scan is empty and db has scores
							const updateDoc = { $set: { top10Scores: norwegianScores } };
							const query = { id: song.id };
							await collection.updateOne(query, updateDoc);
						} else if (norwegianScores.length > 0 && song.top10Scores.length === 0) { // If there are items in new scan but not db
							for (i = 0; i < norwegianScores.length; i++) {
								message.send(`https://scoresaber.com/u/${norwegianScores[i].id} har fått top 10 global på: https://scoresaber.com/leaderboard/${song.id}`);
							}
							const updateDoc = { $set: { top10Scores: norwegianScores } };
							const query = { id: song.id };
							await collection.updateOne(query, updateDoc);
						} else if (norwegianScores.length > 0 && song.top10Scores.length > 0) { // If both contain scores
							let newScores = []; // Scores that are the same in both arrays
							for (var i = 0; i < norwegianScores.length; i++) { // New scores sorting
								var checkBool = false;
								for (var x = 0; x < song.top10Scores.length; x++) {
									if (norwegianScores[i].id === song.top10Scores[x].id) { // If it finds a same score it changes the bool
										checkBool = true;
									}
								}
								if (checkBool == false) { // If bool is false then the score is not in the db
									newScores.push(norwegianScores[i]);
								}
							}

							if (newScores.length > 0) { // If there are new scores
								for (var i = 0; i < newScores.length; i++) {
									message.send(`https://scoresaber.com/u/${newScores[i].id} har fått top 10 global på: https://scoresaber.com/leaderboard/${song.id}`);
								}
								const updateDoc = { $set: { top10Scores: norwegianScores } };
								const query = { id: song.id };
								await collection.updateOne(query, updateDoc);
							} else { // If all scores are the same in both arrays
								return;
							}
						}
					}
				} catch (e) {
					console.log(song.id);
					console.log(await getTime() + e);
				}
			}
		} else {
			return;
		}
	} catch (e) {
		console.log(await getTime() + e + 'Error: top10GlobalThing' + '\n');
	}
	
}

//#region UpdateRankedMaps
async function updateRankedMapsInDB(dbClient) {
	let rankedMaps = [];
	var loopCount = 0;
	while (true) {
		loopCount++;
		try {
			var apiURL = `${scoresaber_url}api/leaderboards?ranked=true&category=1&page=${loopCount}`;
			const response = await fetchAndRetryIfNecessary (async () => (
				await fetch(apiURL)
			));
			if (response.status === 200) {
				var jsonRes = await response.json();
				for (var x = 0; x < jsonRes.leaderboards.length; x++) {
					rankedMaps.push({ id: jsonRes.leaderboards[x].id, hash: jsonRes.leaderboards[x].songHash, topScore: { id: '', name: '', score: 0 }, top10Scores: [] });
				}
				if (jsonRes.leaderboards.length != jsonRes.metadata.itemsPerPage) break;
				await sleep(30);
			}
		} catch (e) {
			console.log(await getTime() + e + 'Error: updateRankedMaps' + '\n');
		}
	}

	const database = dbClient.db('scoresaber-NO');
	const collection = database.collection('ranked-songs-leaderboard');
	const filter = {};
	const options = { projection: { _id: 0 } };
	const cursor = collection.find(filter, options);
	var docArr = [];
	if (await cursor.count() === 0) {
		return await insertRankedUpdateToDB(rankedMaps, collection);
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
		if (docArr.length != 0) {
			return await insertRankedUpdateToDB(docArr, collection);
		}
	}
	
}

async function insertRankedUpdateToDB(docArr, collection) {
	const options = { ordered: true };
	await collection.insertMany(docArr, options);
}
//#endregion

//#region Fetch with api limit handeling
async function fetchAndRetryIfNecessary(callAPIFn, num) {
	try {
		const response = await callAPIFn();
    	if (response.status === 429) {
    	  const retryAfter = response.headers.get('retry-after');
    	  const millisToSleep = getMillisToSleep(retryAfter);
    	  console.log('retry after: ' + millisToSleep);
    	  await sleep(millisToSleep);
    	  return fetchAndRetryIfNecessary(callAPIFn);
    	}
		return response;
	} catch (e) {  // Function will retry 3 times with a 60 sec cooldown
		console.log(await getTime() + e + 'Error: fetchAndRetry' + '\n');
		if (num == undefined) num = 0;
		console.log(await getTime() + num);
		num++;
		if (num == 3) return;
		await sleep(minute);
		return fetchAndRetryIfNecessary(callAPIFn, num);
	} 
}

function getMillisToSleep(retryHeaderString) {
    let millisToSleep = Math.round(parseFloat(retryHeaderString) * 1000);
    if (isNaN(millisToSleep)) {
      millisToSleep = Math.max(0, new Date(retryHeaderString) - new Date());
    }
    return millisToSleep;
}

function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
//#endregion

async function getTime() {
	const date = new Date();
	return `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] - `;
}