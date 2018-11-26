module.exports = (bot, config, db) => {

	const text = config.topmsg; //tops texts

	//set 'state' field in true value (divisions)
	const chatTopActivator = async (chatId, topName) => {
		const chatObj = await db.collection('chats').findOne({
			_id: chatId
		});
		if (chatObj) {
			chatObj.tops[topName] = true;
			await db.collection('chats').updateOne({
				_id: chatId
			}, {
				$set: chatObj
			});
			return ('updated');
		} else {
			return ('not found');
		}
	};

	bot.onText(/\/add_topml/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topml';
		if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
			const updateRes = await chatTopActivator(chatId, topName);
			if (updateRes == 'updated') {
				await bot.sendMessage(chatId, text.topactive);
			} else {
				await bot.sendMessage(chatId, text.chatinactive);
			}
		}
	});

	bot.onText(/\/add_topzero/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topzero';
		if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
			const updateRes = await chatTopActivator(chatId, topName);
			if (updateRes == 'updated') {
				await bot.sendMessage(chatId, text.topactive);
			} else {
				await bot.sendMessage(chatId, text.chatinactive);
			}
		}
	});

	bot.onText(/\/add_topuber/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topuber';
		if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
			const updateRes = await chatTopActivator(chatId, topName);
			if (updateRes == 'updated') {
				await bot.sendMessage(chatId, text.topactive);
			} else {
				await bot.sendMessage(chatId, text.chatinactive);
			}
		}
	});

	bot.onText(/\/add_topsleep/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topsleep';
		if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
			const updateRes = await chatTopActivator(chatId, topName);
			if (updateRes == 'updated') {
				await bot.sendMessage(chatId, text.topactive);
			} else {
				await bot.sendMessage(chatId, text.chatinactive);
			}
		}
	});
};