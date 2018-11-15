const {
	checkFwd,
	checkTime,
	getUserObjTemplate,
	checkLastForward
} = require('../util/tops-func');

module.exports = (bot, config, db) => {

	const files = config.files;
	const textsTriggers = config.triggers;
	const texts = config.tops;

	const getUserPoints = async (userObj, topName) => {
		let userPoints = 0;
		if (userObj.tops.hasOwnProperty(topName)) {
			userPoints = userObj.tops[topName].points;
		}
		return userPoints;
	};

	const updateUserTop = async (userObj, topName, score) => {
		userObj.tops[topName] = {
			points: score
		};
		await db.collection('users').updateOne({
			_id: userObj._id
		}, {
			$set: userObj
		});
	};

	const topConstructor = async (userObj, topName, points) => {
		let score = 0;
		const userPoints = await getUserPoints(userObj, topName);
		if (points) {
			score = (userPoints == 0) ? score = +points : score = +points + userPoints;
		} else {
			score = (userPoints == 0) ? score = 1 : score = userPoints + 1;
		}
		await updateUserTop(userObj, topName, score);
	};

	bot.onText(/Твои результаты в битве на \d{2} часов: @startupwarsreport/, async (msg) => {

		if (await checkFwd(msg)) {

			if (await checkTime(msg)) {

				const userId = msg.from.id;
				const chatId = msg.chat.id;
				const msgId = msg.message_id;
				const msgText = msg.text;

				const money = msgText.match(/💵Деньги: (.*)/);
				const points = msgText.match(/🏆Твой вклад: \+(.*)/);
				const sleep = msgText.match(/Ты проспал всю битву, но зато и все деньги свои сохранил./);

				let userObj = await db.collection('users').findOne({
					_id: userId
				});

				if (!userObj) {
					const userObjTemplate = await getUserObjTemplate(msg);
					await db.collection('users').insertOne(userObjTemplate);
					userObj = await db.collection('users').findOne({
						_id: userId
					});
				}

				// check last forward
				if (await checkLastForward(userObj, msg)) {
					await bot.sendMessage(chatId, texts.reportready, {
						reply_to_message_id: msgId
					});
					return;
				}

				// start topzero top
				if (money && money[1] == '0') {
					let topName = 'topzero';
					await topConstructor(userObj, topName);
					await bot.sendDocument(chatId, files.noMoney, {
						caption: textsTriggers.noMoney,
						reply_to_message_id: msgId
					});
				}
				// end

				//start topuber top
				if (points && points[1] > 100) {
					let topName = 'topuber';
					await topConstructor(userObj, topName);
					if (userId == config.vatman) {
						await bot.sendMessage(chatId, config.phrases.vatmanlooser, {
							reply_to_message_id: msgId
						});
					} else {
						await bot.sendDocument(chatId, files.uber, {
							caption: textsTriggers.uber,
							reply_to_message_id: msgId
						});
					}
				}
				// end

				//start topml top
				if (msgText.match(/💵Деньги: -\$(.*)/)) {
					const topName = 'topml';
					const match = msgText.match(/💵Деньги: -\$(.*)/);
					const clearMatch = match[1];
					const points = +clearMatch;
					await topConstructor(userObj, topName, points);
					await bot.sendMessage(msg.chat.id, texts.report, {
						reply_to_message_id: msg.message_id
					});
				}
				//end

				//start sleep tops
				if (sleep[0]) {
					const topName = 'topsleep';
					await topConstructor(userObj, topName);
					await bot.sendMessage(msg.chat.id, texts.sleep, {
						reply_to_message_id: msg.message_id
					});
				}

				//upd last forward date
				await db.collection('users').updateOne({
					_id: userId
				}, {
					$set: {
						'tops.lastforward': msg.forward_date
					}
				});
			}
		}
	});
};