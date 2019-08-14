module.exports = (schedule, bot, config, db) => {
	bot.onText(/^\/add_team/, async function(msg) {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		console.log('TCL: msg.chat', msg.chat);
		let admin = '';

		const userObj = await db.collection('users').findOne({
			_id: userId
		});

		if (userObj) {
			admin = userObj.admin;
		} else {
			admin = false;
		}

		if (
			msg.chat.type == 'group' ||
			(msg.chat.type == 'supergroup' && admin == true)
		) {
			const teamState = await db.collection('teams').findOne({
				_id: chatId
			});

			if (teamState) {
				await bot.sendMessage(
					chatId,
					`Команда ***${msg.chat.title}*** уже подписана на уведомления`,
					{
						parse_mode: 'Markdown'
					}
				);
			} else {
				const teamData = {
					_id: chatId,
					name: msg.chat.title,
					type: msg.chat.type,
					tag: '',
					state: true,
					tops: {},
					games: {}
				};
				const result = await db.collection('teams').insertOne(teamData);
				if (result.result.ok) {
					await bot.sendMessage(
						chatId,
						`Команда ***${msg.chat.title}*** добавлен в рассылку уведомлений!`,
						{
							parse_mode: 'Markdown'
						}
					);
					await db.collection('users').updateMany(
						{
							_id: userId
						},
						{
							$set: {
								'state.sendMsg': 'team',
								'state.sendMsgChat': chatId
							}
						}
					);
					await bot.sendMessage(chatId, 'Введите тег команды:');
				} else {
					await bot.sendMessage(chatId, config.phrases.error);
				}
			}
		} else {
			await bot.sendMessage(chatId, config.phrases.admin, {
				parse_mode: 'HTML'
			});
		}
	});

	bot.on('message', async function(msg) {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		const userObj = await db.collection('users').findOne({
			_id: userId
		});

		if (userObj) {
			if (
				userObj.state.sendMsg == 'team' &&
				chatId == userObj.state.sendMsgChat
			) {
				const result = await db.collection('teams').updateOne(
					{
						_id: chatId
					},
					{
						$set: {
							tag: msg.text
						}
					}
				);
				if (result.result.ok) {
					await bot.sendMessage(
						chatId,
						`Тег для команды ***${msg.chat.title}*** установлен!`,
						{
							parse_mode: 'Markdown'
						}
					);
				} else {
					await bot.sendMessage(chatId, config.phrases.error);
				}
				await db.collection('users').updateOne(
					{
						_id: userId
					},
					{
						$set: {
							'state.sendMsg': false,
							'state.sendMsgChat': ''
						}
					}
				);
			}
		}
	});
};
