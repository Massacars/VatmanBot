const {
	checkFwd,
	checkTime,
	getUserObjTemplate,
	checkLastForward
} = require('../util/tops-func');

module.exports = (bot, config, db) => {
	const files = config.files;
	const textsTriggers = config.triggers;
	const texts = config.topmsg;

	const getUserPoints = async (userObj, topName) => {
		let userPoints = 0;
		if ('topName' in userObj) {
			userPoints = userObj.tops[topName].points;
		}
		return userPoints;
	};

	const updateUserTop = async (userObj, topName, score) => {
		if (!('tops' in userObj)) {
			return;
		}
		userObj.tops[topName] = {
			points: score
		};
		await db.collection('users').updateOne(
			{
				_id: userObj._id
			},
			{
				$set: userObj
			}
		);
	};

	const topConstructor = async (userObj, topName, points) => {
		let score = 0;
		const userPoints = await getUserPoints(userObj, topName);
		if (points) {
			score =
				userPoints == 0 ? (score = +points) : (score = +points + userPoints);
		} else {
			score = userPoints == 0 ? (score = 1) : (score = userPoints + 1);
		}
		await updateUserTop(userObj, topName, score);
	};

	bot.onText(
		/Твои результаты в битве на \d{2} часов: @startupwarsreport/,
		async msg => {
			if (await checkFwd(msg)) {
				if (await checkTime(msg)) {
					const userId = msg.from.id;
					const chatId = msg.chat.id;
					const msgText = msg.text;

					const money = msgText.match(/💵Деньги: (.*)/);
					const points = msgText.match(/🏆Твой вклад: \+(.*)/);
					const sleep = msgText.match(
						/Ты проспал всю битву, но зато и все деньги свои сохранил./
					);

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
						await bot.sendMessage(chatId, texts.reportready);
						return;
					}

					// start topzero top
					if (money && money[1] == '0') {
						let topName = 'topzero';
						await topConstructor(userObj, topName);
						await bot.sendDocument(chatId, files.noMoney, {
							caption: textsTriggers.noMoney
						});
					}
					// end

					//start topuber top
					if (points && points[1] > config.settings.uber) {
						let topName = 'topuber';
						await topConstructor(userObj, topName);
						if (userId == config.vatman) {
							await bot.sendMessage(
								chatId,
								`${userObj.username}\n ${config.phrases.vatmanlooser}`
							);
						} else {
							await bot.sendDocument(chatId, files.uber, {
								caption: `${userObj.username}\n${textsTriggers.uber}`
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
						await bot.sendMessage(msg.chat.id, `${texts.report}`);
					}
					//end

					//start sleep tops
					if (sleep && sleep[0]) {
						const topName = 'topsleep';
						await topConstructor(userObj, topName);
						await bot.sendMessage(msg.chat.id, `${texts.sleep}`);
					}

					//upd last forward date
					await db.collection('users').updateOne(
						{
							_id: userId
						},
						{
							$set: {
								'tops.lastforward': msg.forward_date
							}
						}
					);
				}
			}
		}
	);
};
