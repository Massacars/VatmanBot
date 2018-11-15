module.exports = (bot, config) => {

	bot.onText(/^👫Мы завершили командное задание/, async function (msg) {
		const msgId = msg.message_id;
		const chatId = msg.chat.id;
		const leaderId = config.team.SM.leader;
		if (leaderId == msg.from.id) {
			await bot.pinChatMessage(chatId, msgId, {
				disable_notification: true
			});
			await bot.sendMessage(chatId, config.phrases.gratz, {
				parse_mode: 'HTML'
			});
		} else {
			await bot.sendMessage(chatId, config.phrases.notyou, {
				parse_mode: 'HTML'
			});
		}
	});

	bot.onText(/^Ты выбрал командное задание:/, async function (msg) {
		const msgId = msg.message_id;
		const chatId = msg.chat.id;
		const leaderId = config.team.SM.leader;
		if (leaderId == msg.from.id) {
			await bot.pinChatMessage(chatId, msgId, {
				disable_notification: true
			});
			await bot.sendMessage(chatId, config.phrases.loosers, {
				parse_mode: 'HTML'
			});
		} else {
			await bot.sendMessage(chatId, config.phrases.notyou, {
				parse_mode: 'HTML'
			});
		}
	});
};