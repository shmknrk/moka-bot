const { Client, Intents, Collection } = require('discord.js');
const { DiscordTogether } = require('discord-together');
const { token, prefix, globalIPAddress, lat, lon, appid, cnt, weatherForecastChannelId } = require('./config.json');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MESSAGES,
	],
});

// weather forecast
const sendWeatherForecast = async (channelId) => {
	try {
		const channel = client.channels.cache.get(channelId);
		const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appid}&units=metric&cnt=${cnt}`);
		let msg = '';

		// date
		const weekday = ['日', '月', '火', '水', '木', '金', '土'];
		let dateTime = new Date(response.data.list[0].dt * 1000);
		const year = dateTime.getFullYear().toString();
		const month = (' ' + (dateTime.getMonth() + 1).toString()).slice(-2);
		const date = (' ' + dateTime.getDate().toString()).slice(-2);
		const day = dateTime.getDay();
		msg += `\`${year}\` / \`${month}\` / \`${date}\`  \`(${weekday[day]})\`\n`;

		for (let i = 0; i < cnt; i++) {
			// time
			dateTime = new Date(response.data.list[i].dt * 1000);
			const hours = ('0' + dateTime.getHours().toString()).slice(-2);
			const minutes = ('0' + dateTime.getMinutes().toString()).slice(-2);
			const time = `${hours}:${minutes}`;

			// temperture
			const tempMax = response.data.list[i].main.temp_max;
			const tempMin = response.data.list[i].main.temp_min;
			const tempMaxStr = (' ' + tempMax.toString().slice(0, 2)).slice(-2);
			const tempMinStr = (' ' + tempMin.toString().slice(0, 2)).slice(-2);

			// emoji
			let emoji = '';
			switch (response.data.list[i].weather[0].description) {
			case 'clear sky':
				emoji = ':sunny:'; break;
			case 'few clouds':
				emoji = ':partly_sunny:'; break;
			case 'scattered clouds': case 'broken clouds': case 'overcast clouds':
				emoji = ':cloud:'; break;
			case 'light intensity shower rain': case 'shower rain': case 'heavy intensity shower rain':
			case 'ragged shower rain': case 'light intensity drizzle': case 'drizzle': case 'heavy intensity drizzle':
			case 'light intensity drizzle rain': case 'drizzle rain': case 'heavy intensity drizzle rain':
			case 'shower rain and drizzle': case 'heavy shower rain and drizzle': case 'shower drizzle':
				emoji = ':cloud_rain:'; break;
			case 'rain': case 'light rain': case 'moderate rain': case 'heavy intensity rain':
			case 'very heavy rain': case 'extreme rain':
				emoji = ':white_sun_rain_cloud:'; break;
			case 'thunderstorm with light rain': case 'thunderstorm with rain': case 'thunderstorm with heavy rain':
			case 'light thunderstorm': case 'thunderstorm': case 'heavy thunderstorm': case 'ragged thunderstorm':
			case 'thunderstorm with light drizzle': case 'thunderstorm with drizzle': case 'thunderstorm with heavy drizzle':
				emoji = ':thunder_cloud_rain:'; break;
			case 'snow': case 'light snow': case 'Snow': case 'Heavy snow': case 'Sleet': case 'Light shower sleet':
			case 'Shower sleet': case 'Light rain and snow': case 'Rain and snow': case 'Light shower snow':
			case 'Shower snow': case 'Heavy shower snow': case 'freezing rain':
				emoji = ':snowflake:'; break;
			case 'mist': case 'Smoke': case 'Haze': case 'sand/ dust whirls': case 'fog': case 'sand':
			case 'dust': case 'volcanic ash': case 'squalls':
				emoji = ':fog:'; break;
			case 'tornado':
				emoji = ':cloud_tornado:'; break;
			default:
				emoji = ':boom:'; break;
			}
			msg += `\`${time}\`        ${emoji}    \`${tempMaxStr}\` / \`${tempMinStr}\` ℃\n`;
		}
		await channel.send(msg);
	}
	catch (error) {
		console.error(error);
	}
};

client.on('ready', () => {
	cron.schedule('0 7 * * *', () => {
		sendWeatherForecast(weatherForecastChannelId);
	});
});

// Minecraft Server Status
const setActivityMcsrvstat = async () => {
	try {
		const response = await axios.get(`https://api.mcsrvstat.us/2/${globalIPAddress}`);
		if (!response.data.online) {
			client.user.setActivity('minecraft server is down');
			return;
		}
		const n = response.data.players.online;
		if (n == 0) {
			client.user.setActivity('0 online, minecraft');
			return;
		}
		// if (online && n > 0)
		let playersListStr = '';
		let playersList;
		if (typeof response.data.players.list !== 'undefined') {
			playersList = response.data.players.list;
		}
		else if (typeof response.data.info !== 'undefined' && typeof response.data.info.raw !== 'undefined') {
			playersList = response.data.info.raw;
		}
		else {
			client.user.setActivity('Error: cannot read players list');
			return;
		}
		for (let i = 0; i < n; i++) {
			playersListStr += playersList[i];
			playersListStr += i < n - 1 ? ' ' : ',';
		}
		client.user.setActivity(`${n} online, ${playersListStr} minecraft`);
	}
	catch (error) {
		console.error(error);
	}
};

client.on('ready', () => {
	cron.schedule('* * * * *', () => {
		setActivityMcsrvstat();
	});
});

// Discord Together
client.discordTogether = new DiscordTogether(client);

// Music Bot Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.name, command);
}

// Commands
client.on('messageCreate', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	// Discord Together
	if (message.content === '!youtube') {
		if (message.member.voice.channel) {
			client.discordTogether.createTogetherCode(message.member.voice.channel.id, 'youtube').then(async invite => {
				await message.channel.send(`${invite.code}`);
				return;
			});
		}
	}
	else if (message.content === '!wordsnack') {
		if (message.member.voice.channel) {
			client.discordTogether.createTogetherCode(message.member.voice.channel.id, 'wordsnack').then(async invite => {
				await message.channel.send(`${invite.code}`);
				return;
			});
		}
	}
	else if (message.content === '!sketchheads') {
		if (message.member.voice.channel) {
			client.discordTogether.createTogetherCode(message.member.voice.channel.id, 'sketchheads').then(async invite => {
				await message.channel.send(`${invite.code}`);
				return;
			});
		}
	}

	// Music Bot Commands
	const args = message.content.slice(prefix.length).split(/ +/);
	const command = client.commands.get(args.shift());
	if (!command) return;

	try {
		await command.execute(message);
	}
	catch (error) {
		console.error(error);
		await message.channel.send({ content: 'There was an error while executing this command!' });
	}
});

client.login(token);
