const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	name: 'dc',
	async execute(message) {
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) {
			await message.channel.send('Cannot read voice channel ID!');
			return;
		}
		const connection = getVoiceConnection(voiceChannel.guild.id);
		if (!connection) {
			await message.channel.send('There is no connection!');
			return;
		}
		connection.destroy();
		await message.channel.send('See you!');
	},
};
