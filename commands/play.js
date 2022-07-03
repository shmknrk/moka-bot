const fs = require('node:fs');
const { createReadStream } = require('node:fs');
const path = require('node:path');
const {
	joinVoiceChannel,
	getVoiceConnection,
	createAudioPlayer,
	createAudioResource,
	StreamType,
	AudioPlayerStatus,
} = require('@discordjs/voice');
const { playlistPath } = require('../config.json');

const playlist = new Array();
const audioFiles = fs.readdirSync(playlistPath).filter(file => file.endsWith('.webm'));
for (const file of audioFiles) {
	const filePath = path.join(playlistPath, file);
	playlist.push(filePath);
}

const getResource = (() => {
	const i = Math.floor(Math.random() * (playlist.length));
	return createAudioResource(createReadStream(playlist[i]), {
		inputType: StreamType.WebmOpus,
	});
});

module.exports = {
	name: 'play',
	playlist: playlist,
	async execute(message) {
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) {
			await message.channel.send('Cannot read voice channel ID!');
			return;
		}
		let connection = getVoiceConnection(voiceChannel.guild.id);
		if (!connection) {
			connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				selfDeaf: false,
			});
		}
		const player = createAudioPlayer();
		player.play(getResource());
		connection.subscribe(player);
		await message.channel.send('Play songs!');
		player.on(AudioPlayerStatus.Idle, async () => {
			player.play(getResource());
		});
	},
};
