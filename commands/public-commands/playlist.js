const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { minute } = require('../../timerHelper.json');
const Canvas = require('canvas');
const { MessageAttachment } = require('discord.js');
const fs = require('fs');
module.exports = { // bsno!playlist
	name: 'playlist',
	description: 'Makes playlists',
	args: true,
	guildOnly: true,
	cooldown: 1,
	async execute(message, args, client, dbClient) {
        await doTheThing(message, args, dbClient);
	},
};

async function doTheThing(message, args, dbClient) {
  if (args[1] === undefined) return message.channel.send('Please give a second argument!');
  switch (args[0]) {
    case 'no1':
      await doNo1(message, args, dbClient);
      return;
    case 'top10':
      await doTop10(message, args, dbClient);
      return;
    default:
      message.channel.send(`Wrong usage of command! \"${args[0]}\" does not exist!`);
      return;
  }
}

async function doNo1(message, args, dbClient) {
  const database = dbClient.db('scoresaber-NO');
  const collection = database.collection('ranked-songs-leaderboard');
	const filter = { 'topScore.id': args[1] };
	const options = { projection: { _id: 0, top10Scores: 0 } };
  const cursor = collection.find(filter, options);
  var dbArr = await cursor.toArray();
  if (dbArr.length === 0) {
    return await message.channel.send('This user has no #1 norway scores!');
  }
  var playlistSongs = [];
  var num = dbArr.length;
  var numDivide = num / 10;
  var msgBar = '----------';
  const msg = await message.channel.send(`Going though ${num} scores\n <${msgBar}>`);
  var i = 0;
  for (const song of dbArr) {
    var songJson = {
      hash: song.hash,
      levelid: `custom_level_${song.hash}`,
      difficulties: [
        {
          characteristic: 'Standard',
          name: await fetchDiffName(song.id)
        }
      ]
    }
    playlistSongs.push(songJson);
    if (i + 1 >= numDivide) {
      numDivide = numDivide + (num / 10);
      msgBar = '#' + msgBar.substring(0, msgBar.length - 1);
      await msg.edit(`Going though ${num} scores\n <${msgBar}>`);
    }
    i++;
  }
  await msg.edit(`Going though ${num} scores\n <##########>`);

  // This makes the playlist image
  const canvas = Canvas.createCanvas(500, 500);
	const context = canvas.getContext('2d');

  const background = await Canvas.loadImage('botBase.png');
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
	  let fontSize = 80;
	  do {
	  	context.font = `${fontSize -= 10}px sans-serif`;
	  } while (context.measureText(text).width > canvas.width - 50);
	  return context.font;
  }
  context.strokeRect(0, 0, canvas.width, canvas.height);

  context.font = '60px sans-serif';
	context.fillStyle = '#ffffff';
  context.textAlign = 'center';
	context.fillText('#1 Farming', canvas.width / 2, canvas.height / 6);

  context.font = applyText(canvas, dbArr[0].topScore.name);
	context.fillStyle = '#ffffff';
  context.textAlign = 'center';
	context.fillText(dbArr[0].topScore.name, canvas.width / 2, canvas.height / 3);

  var playlistFile = {
    playlistTitle: `#1 Norway snipes: ${dbArr[0].topScore.name}`,
    playlistAuthor: 'BungBot',
    playlistDescription: 'Funny playlist hahaBall',
    songs: playlistSongs,
    image: `base64,${Buffer.from(canvas.toBuffer()).toString('base64')}`
  }
  var buf = new Buffer.from(JSON.stringify(playlistFile, null, 2));
  await message.channel.send(':sunglasses:', { files: [{ attachment: buf, name: `funny-no1-${args[1]}.json` }] });
}

async function doTop10(message, args, dbClient) {
  const database = dbClient.db('scoresaber-NO');
  const collection = database.collection('ranked-songs-leaderboard');
	const filter = { 'top10Scores': { '$elemMatch': { id: args[1] } } };
	const options = { projection: { _id: 0, topScore: 0 } };
  const cursor = collection.find(filter, options);
  var dbArr = await cursor.toArray();
  if (dbArr.length === 0) {
    return message.channel.send('This user has no top 10 global scores!');
  }
  var num = dbArr.length;
  var numDivide = num / 10;
  var msgBar = '----------';
  const msg = await message.channel.send(`Going though ${num} scores\n <${msgBar}>`);
  var i = 0;
  var playlistSongs = [];
  var username = '';
  for (const song of dbArr) {
    for (var i = 0; i < song.top10Scores.length; i++) {
      if (song.top10Scores[i].id === args[1]) {
        if (username === '') username = song.top10Scores[i].name;
        var songJson = {
          hash: song.hash,
          levelid: `custom_level_${song.hash}`,
          difficulties: [
            {
              characteristic: 'Standard',
              name: await fetchDiffName(song.id)
            }
          ]
        }
        playlistSongs.push(songJson);
        if (i + 1 >= numDivide) {
          numDivide = numDivide + (num / 10);
          msgBar = '#' + msgBar.substring(0, msgBar.length - 1);
          await msg.edit(`Going though ${num} scores\n <${msgBar}>`);
        }
        i++;
      }
    }
  }
  await msg.edit(`Going though ${num} scores\n <##########>`);

  // This makes the playlist image
  const canvas = Canvas.createCanvas(500, 500);
	const context = canvas.getContext('2d');
  
  const background = await Canvas.loadImage('botBase.png');
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
	  let fontSize = 80;
	  do {
	  	context.font = `${fontSize -= 10}px sans-serif`;
	  } while (context.measureText(text).width > canvas.width - 50);
	  return context.font;
  }
  context.strokeRect(0, 0, canvas.width, canvas.height);

  context.font = '60px sans-serif';
	context.fillStyle = '#ffffff';
  context.textAlign = 'center';
	context.fillText('Top 10 Farming', canvas.width / 2, canvas.height / 6);

  context.font = applyText(canvas, username);
	context.fillStyle = '#ffffff';
  context.textAlign = 'center';
	context.fillText(username, canvas.width / 2, canvas.height / 3);

  var playlistFile = {
    playlistTitle: `Top 10 global snipes: ${username}`,
    playlistAuthor: 'BungBot',
    playlistDescription: 'Funny playlist hahaBall',
    songs: playlistSongs,
    image: `base64,${Buffer.from(canvas.toBuffer()).toString('base64')}`
  }
  var buf = new Buffer.from(JSON.stringify(playlistFile, null, 2));
  message.channel.send(':sunglasses:', { files: [{ attachment: buf, name: `funny-top10-${args[1]}.json` }] });
}

async function fetchDiffName(songId) {
  try {
    var apiURL = `https://scoresaber.com/api/leaderboard/by-id/${songId}/info`;
    const response = await fetchAndRetryIfNecessary (async () => (
      await fetch(apiURL)
    ));
    if (response.status === 200) {
      var jsonRes = await response.json();
      switch (jsonRes.difficulty.difficultyRaw) {
        case '_ExpertPlus_SoloStandard':
          return 'ExpertPlus';
        case '_Expert_SoloStandard':
          return 'Expert';
        case '_Hard_SoloStandard':
          return 'Hard';
        case '_Normal_SoloStandard':
          return 'Normal';
        case '_Easy_SoloStandard':
          return 'Easy';
        default: 
          console.log('Default on playlist.js should not happen!!!');
          return '';
      }
    }
  } catch (e) {
    console.log(await getTime() + e + 'Error: fetchDiffName' + '\n');
    return '';
  }
}

//#region Fetch with api limit handeling
async function fetchAndRetryIfNecessary (callAPIFn, num) {
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

async function getTime() {
	const date = new Date();
	return `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] - `;
}