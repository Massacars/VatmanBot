module.exports = (bot, config) => {
	bot.onText(/\#ватфразочка/, async function(msg, match) {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		const userName = msg.from.first_name;
		const userLastName = msg.from.last_name;
		const username = msg.from.username;
		const chatTitle = msg.chat.title;
		const text = msg.text;
		await bot.sendMessage(config.admin, userName + ' ' + userLastName + ' / ' + username + ' Чат: ' + chatTitle + ' Фраза: ' + text);
		await bot.sendMessage(chatId, config.phrases.ty);
	});

	bot.onText(/\#ватідея/, async function(msg, match) {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		const userName = msg.from.first_name;
		const userLastName = msg.from.last_name;
		const username = msg.from.username;
		const chatTitle = msg.chat.title;
		const text = msg.text;
		await bot.sendMessage(config.admin, userName + ' ' + userLastName + ' / ' + username + ' Чат: ' + chatTitle + ' Ідея: ' + text);
		await bot.sendMessage(chatId, config.phrases.ty);
	});
}