module.exports = (bot, config) => {
	bot.onText(/#ватфразочка/, async function(msg) {
		const chatId = msg.chat.id;
		const userName = msg.from.first_name;
		const userLastName = msg.from.last_name;
		const username = msg.from.username;
		const chatTitle = msg.chat.title;
		const text = msg.text;
		await bot.sendMessage(
			config.admin,
			userName +
				' ' +
				userLastName +
				' / ' +
				username +
				'\nЧат: ' +
				chatTitle +
				'\nІдея для відділу: ' +
				text
		);
		await bot.sendMessage(chatId, config.phrases.ty);
	});

	bot.onText(/#ватидея/, async function(msg) {
		const chatId = msg.chat.id;
		const userName = msg.from.first_name;
		const userLastName = msg.from.last_name;
		const username = msg.from.username;
		const chatTitle = msg.chat.title;
		const text = msg.text;
		await bot.sendMessage(
			config.admin,
			userName +
				' ' +
				userLastName +
				' / ' +
				username +
				'\nЧат: ' +
				chatTitle +
				'\nІдея для відділу: ' +
				text
		);
		await bot.sendMessage(chatId, config.phrases.ty);
	});

	bot.onText(/#длякоманды/, async function(msg) {
		const chatId = msg.chat.id;
		const userName = msg.from.first_name;
		const userLastName = msg.from.last_name;
		const username = msg.from.username;
		const chatTitle = msg.chat.title;
		const text = msg.text;
		await bot.sendMessage(
			config.admin,
			userName +
				' ' +
				userLastName +
				' / ' +
				username +
				'\nЧат: ' +
				chatTitle +
				'\nІдея для відділу: ' +
				text
		);
		await bot.sendMessage(chatId, config.phrases.ty);
	});

	bot.onText(/#дляотдела/, async function(msg) {
		const chatId = msg.chat.id;
		const userName = msg.from.first_name;
		const userLastName = msg.from.last_name;
		const username = msg.from.username;
		const chatTitle = msg.chat.title;
		const text = msg.text;
		await bot.sendMessage(
			config.admin,
			userName +
				' ' +
				userLastName +
				' / ' +
				username +
				'\nЧат: ' +
				chatTitle +
				'\nІдея для відділу: ' +
				text
		);
		await bot.sendMessage(chatId, config.phrases.ty);
	});

	bot.onText(/#теги/, async function(msg) {
		const chatId = msg.chat.id;
		const userId = msg.from.id;
		const chatType = msg.chat.type;
		const tags = config.tags;
		if (chatType == 'private') {
			await bot.sendMessage(userId, tags, { parse_mode: 'HTML' });
		} else {
			await bot.sendMessage(chatId, tags, { parse_mode: 'HTML' });
		}
	});
};
