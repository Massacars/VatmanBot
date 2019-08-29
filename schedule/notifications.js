module.exports = (schedule, bot, config, db) => {
	const settings = config.chatSettings.notification;

	const formatString = require('../util/formatString');
	const { eatNotifString } = require('../strings/chats-strings');

	const eatFirstNotifRule = generateRecurrenceRule(
		settings.eatFirst.hour,
		settings.eatFirst.minute
	);
	const eatLastNotifRule = generateRecurrenceRule(
		settings.eatLast.hour,
		settings.eatLast.minute
	);
	const moneyNotifRule = generateRecurrenceRule(
		settings.money.hour,
		settings.money.minute
	);
	const sleepNotifRule = generateRecurrenceRule(
		settings.sleep.hour,
		settings.sleep.minute
	);

	schedule.scheduleJob(eatFirstNotifRule, async () => {
		const notifyArr = await db
			.collection('chats')
			.find({
				state: true
			})
			.toArray();
		if (notifyArr.length > 0) {
			notifyArr.forEach(async chats => {
				const chatObj = await db.collection('chats').findOne({
					_id: chats._id
				});
				try {
					await bot.sendMessage(chats._id, await generateEatMessage(chatObj), {
						parse_mode: 'HTML'
					});
				} catch (error) {
					console.log(`${chats.name} ${error.message}`);
				}
			});
		}
	});

	schedule.scheduleJob(eatLastNotifRule, async () => {
		const notifyArr = await db
			.collection('chats')
			.find({
				state: true
			})
			.toArray();
		if (notifyArr.length > 0) {
			notifyArr.forEach(async chats => {
				const chatObj = await db.collection('chats').findOne({
					_id: chats._id
				});
				try {
					const scheduledMsg = await bot.sendMessage(
						chats._id,
						await generateEatMessage(chatObj),
						{
							parse_mode: 'HTML'
						}
					);
					bot.pinChatMessage(chats._id, scheduledMsg.message_id, {
						disable_notification: true
					});
				} catch (error) {
					console.log(`${chats.name} ${error.message}`);
				}
			});
		}
	});

	schedule.scheduleJob(moneyNotifRule, async () => {
		const notifyArr = await db
			.collection('chats')
			.find({
				state: true
			})
			.toArray();
		if (notifyArr.length > 0) {
			notifyArr.forEach(async chats => {
				try {
					const scheduledMsg = await bot.sendMessage(
						chats._id,
						config.pinmsg.money,
						{
							parse_mode: 'HTML'
						}
					);
					bot.pinChatMessage(chats._id, scheduledMsg.message_id);
				} catch (error) {
					console.log(`${chats.name} ${error.message}`);
				}
			});
		}
	});

	schedule.scheduleJob(sleepNotifRule, async () => {
		const notifyArr = await db
			.collection('chats')
			.find({
				state: true
			})
			.toArray();
		if (notifyArr.length > 0) {
			notifyArr.forEach(async chats => {
				try {
					const scheduledMsg = await bot.sendMessage(
						chats._id,
						config.pinmsg.sleep,
						{
							parse_mode: 'HTML'
						}
					);
					bot.pinChatMessage(chats._id, scheduledMsg.message_id, {
						disable_notification: true
					});
				} catch (error) {
					console.log(`${chats.name} ${error.message}`);
				}
			});
		}
	});

	function generateRecurrenceRule(hour, min) {
		const rule = new schedule.RecurrenceRule();
		rule.hour = hour;
		rule.minute = min;
		return rule;
	}

	async function generateEatMessage(chatObj) {
		let chatTag = '';
		if (chatObj.tag) {
			chatTag = chatObj.tag;
		}
		return formatString(eatNotifString, chatObj.name, chatTag);
	}
};
