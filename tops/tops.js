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

	//generate statistic string (users)
	const generateTopStats = async (chatId, topName, topEmoji) => {
		const usersArr = await db.collection('users').find({
			[`tops.${topName}.points`]: {
				$gt: 0
			},
			division: chatId
		}).sort({
			points: -1
		}).toArray();

		if (usersArr.length !== -1) {
			let statsSring = '';
			let i = 1;
			let statsSumm = 0;
			let top = '';

			usersArr.forEach(async (user) => {
				switch (i) {
				case 1:
					top = '🥇';
					break;
				case 2:
					top = '🥈';
					break;
				case 3:
					top = '🥉';
					break;
				default:
					top = ` ${i} `;
					break;
				}
				statsSring = statsSring + `
				▪️${top}  <b>${user.username}</b>	${user.tops[topName].points} ${topEmoji}`;
				statsSumm = statsSumm + user.tops[topName].points;
				i++;
			});
			statsSumm = `${statsSumm} ${topEmoji}`;
			return ({
				statsSring,
				statsSumm
			});
		} else {
			return ('false');
		}
	};

	//generate report message
	const generateTopReport = async ({
		name,
		tag,
		stats,
		summ,
		string
	}) => {
		const topString = `
		${string}
		Отдел: ${name}						
		${stats}
		
		Суммарно по отделу <b>[${tag}]</b>: ${summ}
		`;
		return (topString);
	};

	bot.onText(/\/tops/, async function (msg) {
		const chatId = msg.chat.id;
		if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
			bot.sendMessage(chatId,	'Список топов:\n💰 Топ горе инвесторов - /topml (вкл. - /add_topml)\n0️⃣ Топ держателей нулей - /topzero (вкл. - /add_topzero)\n🚕 Топ уберпопулярных - /topuber (вкл. - /add_topuber)');
		}
	});

	bot.onText(/\/add_topml/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topml';
		if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
			const updateRes = await chatTopActivator(chatId, topName);
			if (updateRes == 'updated') {
				await bot.sendMessage(chatId, config.topmsg.topactive);
			} else {
				await bot.sendMessage(chatId, config.topmsg.chatinactive);
			}
		}
	});

	bot.onText(/\/add_topzero/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topzero';
		if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
			const updateRes = await chatTopActivator(chatId, topName);
			if (updateRes == 'updated') {
				await bot.sendMessage(chatId, config.topmsg.topactive);
			} else {
				await bot.sendMessage(chatId, config.topmsg.chatinactive);
			}
		}
	});

	bot.onText(/\/add_topuber/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topuber';
		if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
			const updateRes = await chatTopActivator(chatId, topName);
			if (updateRes == 'updated') {
				await bot.sendMessage(chatId, config.topmsg.topactive);
			} else {
				await bot.sendMessage(chatId, config.topmsg.chatinactive);
			}
		}
	});

	bot.onText(/\/topml/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topml';
		const topEmoji = '💵';
		const chatObj = await db.collection('chats').findOne({
			_id: chatId
		});
		const chatActive = (chatObj) ? chatObj.tops.hasOwnProperty(topName) : false;

		if (chatActive) {
			const stats = await generateTopStats(chatId, topName, topEmoji);
			if (stats.statsSring) {
				const topObj = {
					name: chatObj.name,
					tag: chatObj.tag,
					stats: stats.statsSring,
					summ: stats.statsSumm,
					string: '💰 Топ горе инвесторов'
				};
				const report = await generateTopReport(topObj);
				await bot.sendMessage(chatId, report, {
					parse_mode: 'HTML'
				});
			} else {
				await bot.sendMessage(chatId, text.empty);
			}
		} else {
			await bot.sendMessage(chatId, text.topinactive);
		}
	});

	bot.onText(/\/topzero/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topzero';
		const topEmoji = '📄';
		const chatObj = await db.collection('chats').findOne({
			_id: chatId
		});
		const chatActive = (chatObj) ? chatObj.tops.hasOwnProperty(topName) : false;

		if (chatActive) {
			const stats = await generateTopStats(chatId, topName, topEmoji);
			if (stats.statsSring) {
				const topObj = {
					name: chatObj.name,
					tag: chatObj.tag,
					stats: stats.statsSring,
					summ: stats.statsSumm,
					string: '0️⃣ Топ держателей нулей'
				};
				const report = await generateTopReport(topObj);
				await bot.sendMessage(chatId, report, {
					parse_mode: 'HTML'
				});
			} else {
				await bot.sendMessage(chatId, text.empty);
			}
		} else {
			await bot.sendMessage(chatId, text.topinactive);
		}
	});

	bot.onText(/\/topuber/, async function (msg) {
		const chatId = msg.chat.id;
		const topName = 'topuber';
		const topEmoji = '📄';
		const chatObj = await db.collection('chats').findOne({
			_id: chatId
		});
		const chatActive = (chatObj) ? chatObj.tops.hasOwnProperty(topName) : false;

		if (chatActive) {
			const stats = await generateTopStats(chatId, topName, topEmoji);
			if (stats.statsSring) {
				const topObj = {
					name: chatObj.name,
					tag: chatObj.tag,
					stats: stats.statsSring,
					summ: stats.statsSumm,
					string: '🚕 Топ уберпопулярных'
				};
				const report = await generateTopReport(topObj);
				await bot.sendMessage(chatId, report, {
					parse_mode: 'HTML'
				});
			} else {
				await bot.sendMessage(chatId, text.empty);
			}
		} else {
			await bot.sendMessage(chatId, text.topinactive);
		}
	});

};