const {
	checkFwd,
	checkTime,
	getUserObjTemplate,
	checkLastForward
} = require('../util/tops-func');

module.exports = (bot, config, db, scheduler) => {

	const gameName = 'pizza';

	const createPizza = async (chatId, gameName, hp) => {
		const pizzaObj = {
			date: Date.now(),
			hp: hp,
			inDamage: {},
			state: 'active'
		};

		const status = await db.collection('chats').updateOne({
			_id: chatId
		}, {
			$set: {
				[`games.${gameName}.enemylist.`]: pizzaObj
			}
		});

		if (status.result.ok) {
			return status.result.ok;
		}
	};

	const updateHp = async (chatId, gameName, hp) => {
		const status = await db.collection('chats').updateOne({
			_id: chatId
		}, {
			$set: {
				[`games.${gameName}.enemy.hp`]: hp
			}
		});
		if (status.result.ok){
			return status.result.ok;
		}		
	};

	const regDamage = async (chatId, gameName, userId, damage) => {
		const damageDealed = await db.collection('chats').findOne({
			_id: chatId
		}, {
			[`games.${gameName}.enemy.inDamage.${userId}`]: 1
		});

		const updatedDamage = damageDealed + damage;

		await db.collection('chats').updateOne({
			_id: chatId
		}, {
			$set: {
				[`games.${gameName}.enemy.inDamage.${userId}`]: updatedDamage
			}
		});
	};

	const dealDamage = async (chatId, userId, gameName, damage) => {
		const hp = await db.collection('chats').findOne({
			_id: chatId
		}, {
			[`games.${gameName}.enemy.hp`]: 1
		});
		const updatedHp = hp - damage;
		await updateHp(chatId, gameName, updatedHp);
		await regDamage(chatId, userId, damage, gameName);
		return updatedHp;
	};

	const chatGameActivator = async (chatId, gameName) => {
		const chatObj = await db.collection('chats').findOne({
			_id: chatId
		});
		if (chatObj) {
			chatObj.games[gameName] = {state: true};
			await db.collection('chats').updateOne({
				_id: chatId
			}, {
				$set: chatObj
			});
			await createPizza(chatId, gameName, 1000);
			return ('updated');
		} else {
			return ('not found');
		}
	};

	bot.onText(/\/go_pizza/, async (msg) => {
		const chatId = msg.chat.id;
		const active = await chatGameActivator(chatId, gameName);
		if (active === 'updated') {
			console.log('updated');
		} else {
			console.log('not found');
		}
	});

	bot.onText(/Твои результаты в битве на \d{2} часов: @startupwarsreport/, async (msg) => {
		if (await checkFwd(msg)) {
			if (await checkTime(msg)) {
				const userId = msg.from.id;
				const chatId = msg.chat.id;
				const msgText = msg.text;
				const damage = +msgText.match(/🏆Твой вклад: (.*)/)[1];

				if (damage > 0) {
					const hp = await dealDamage(chatId, userId, gameName, damage);
					console.log(hp);
				}

				if (damage == 0) {
					const hp = await noDamage()
				}

				if (damage < 0) {
					const hp = await heal(damage);
				}

			}
		}
	});
};