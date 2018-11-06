module.exports = (bot, config, db) => {

	const files = config.files;
	const texts = config.triggers;

	const addUser = async (msg) => {
		const userData = {
			_id: msg.from.id,
			name: msg.from.first_name,
			lastName: msg.from.last_name,
			username: '@' + msg.from.username,
			admin: false,
			division: msg.chat.id,
			state: {
				active: true,
				sendMsg: false,
				sendLvl: false,
				sendMsgChat: ''
			},
			tops: {
				lastforward: 0
			}
		};
		await db.collection('users').insertOne(userData);
	};

	const getUserData = async (userId, topName) => {
		let userData = {
			points: 0
		};
		const userObj = await db.collection('users').findOne({
			_id: userId
		});		
		if (userObj.tops.hasOwnProperty(topName)) {
			userData.points = userObj.tops[topName].points;				
		}		
		return(userData);
	};

	const updateUserTop = async (userId, chatId, topObj) => {
		const topField = topObj.field;
		const topPoints = topObj.points;
		let userObj = await db.collection('users').findOne({_id: userId});
		userObj.tops[topField] = {
			points: topPoints
		};
		await db.collection('users').updateOne({_id: userId	}, { $set: userObj });
	};

	bot.onText(/Твои результаты в битве на \d{2} часов: @startupwarsreport/, async (msg) => {
		if (msg.forward_from.username === 'StartupWars01Bot' || msg.forward_from.username === 'StartupWars01Bot') {
			const userId = msg.from.id;
			const chatId = msg.chat.id;
			const msgId = msg.message_id;
			const msgText = msg.text;
			const money = msgText.match(/💵Деньги: (.*)/);
			const points = msgText.match(/🏆Твой вклад: \+(.*)/);						
			const currentTime = Math.floor(Date.now() / 1000);

			if (currentTime - msg.forward_date < 43200) {

				let userObj = await db.collection('users').findOne({_id: userId});
				if (!userObj){
					await addUser(msg);
					userObj = await db.collection('users').findOne({
						_id: userId
					});
				}

				// check last forward
				if (userObj.tops.lastforward == msg.forward_date) {
					await bot.sendMessage(chatId, config.topmsg.reportready, {
						reply_to_message_id: msgId
					});
					return;
				}

				// start topzero top
				if (money && money[1] == '0') {
					let topName = 'topzero';
					let topObj = {};
					let score = 0;
					const userData = await getUserData(userId, topName);
					score = (userData.points == 0) ? score = 1 : score = userData.points + 1;
					topObj = {
						field: topName,
						points: score
					};
					await updateUserTop(userId, chatId, topObj);
					await bot.sendDocument(chatId, files.noMoney, {
						caption: texts.noMoney,
						reply_to_message_id: msgId
					});
				}
				// end

				//start topuber top
				if (points && points[1] > 100) {
					let topName = 'topuber';
					let topObj = {};
					let score = 0;
					const userData = await getUserData(userId, topName);			
					score = (userData.points == 0) ? score = 1 : score = userData.points + 1;
					topObj = {
						field: topName,
						points: score
					};
					await updateUserTop(userId, chatId, topObj);
					if (userId == config.vatman) {
						await bot.sendMessage(chatId, config.phrases.vatmanlooser, {
							reply_to_message_id: msgId
						});
					} else {
						await bot.sendDocument(chatId, files.uber, {
							caption: config.vatmanCaption,
							reply_to_message_id: msgId
						});
					}
				}
				// end

				//start top
				if (msgText.match(/💵Деньги: -\$(.*)/)) {
					const topName = 'topml';					
					let topObj = {};				
					const match = msgText.match(/💵Деньги: -\$(.*)/);
					const clearMatch = match[1];
					const points = +clearMatch;
					const userData = await getUserData(userId, topName);
					let score = 0;					
					score = (userData.points == 0) ? score = +points : score = +points + userData.points;
					topObj = {
						field: topName,
						points: score						
					};
					await updateUserTop(userId, chatId, topObj);					
					await bot.sendMessage(msg.chat.id, config.topmsg.report, {
						reply_to_message_id: msg.message_id
					});					
				}
				//end

				//upd last forward date
				await db.collection('users').updateOne({_id: userId},{
					$set: {
						'tops.lastforward': msg.forward_date
					}
				});				
			}
		}
	});

	bot.onText(/^👫Мы завершили командное задание/, async function (msg) {
		const msgId = msg.message_id;
		const chatId = msg.chat.id;
		const leaderId = config.team.SM.leader;
		if (leaderId == msg.from.id) {
			await bot.pinChatMessage(chatId, msgId, { disable_notification: true });
			await bot.sendMessage(chatId, config.phrases.gratz, { parse_mode: 'HTML' });
		} else {
			await bot.sendMessage(chatId, config.phrases.notyou, { parse_mode: 'HTML' });
		}
	});

	bot.onText(/^Ты выбрал командное задание:/, async function (msg) {
		const msgId = msg.message_id;
		const chatId = msg.chat.id;
		const leaderId = config.team.SM.leader;
		if (leaderId == msg.from.id) {
			await bot.pinChatMessage(chatId, msgId, { disable_notification: true });
			await bot.sendMessage(chatId, config.phrases.loosers, { parse_mode: 'HTML' });
		} else {
			await bot.sendMessage(chatId, config.phrases.notyou, { parse_mode: 'HTML' });
		}
	});
};