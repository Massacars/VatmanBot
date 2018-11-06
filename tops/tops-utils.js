module.exports = (bot, config, db) => {

	bot.onText(/\/hard_reset/, async msg => {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		const checkUser = await db.collection('users').findOne({
			_id: userId,
			admin: true
		});
		if (checkUser._id == config.admin) {
			await db.collection('users').updateMany({
				division: chatId
			}, {
				$set: {
					tops: {}
				}
			});
			await bot.sendMessage(chatId, config.phrases.hello);
		}
	});
	
	bot.onText(/\/reset_(.*)/, async (msg, match) => {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		const topName = match[1];
		const checkUser = await db.collection('users').findOne({
			_id: userId,
			admin: true
		});
		if (checkUser._id == config.admin) {
			await db.collection('users').updateMany({
				division: chatId
			}, {
				$unset: {
					[`tops.${topName}`]: 1
				}
			});
			await bot.sendMessage(chatId, config.phrases.hello);
		}
	});
};