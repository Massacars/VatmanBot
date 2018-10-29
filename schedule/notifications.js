module.exports = (schedule, bot, config, db) => {
	const formatString = require('../util/formatString');
	const { eatNotifString } = require('../strings/chats-strings');

	const eatFirstNotifRule = new schedule.RecurrenceRule();
	eatFirstNotifRule.hour = [8, 11, 14, 17, 20];
	eatFirstNotifRule.minute = 50;

	const eatLastNotifRule = new schedule.RecurrenceRule();
	eatLastNotifRule.hour = [9, 12, 15, 18, 21];
	eatLastNotifRule.minute = '05';

	const moneyNotifRule = new schedule.RecurrenceRule();
	moneyNotifRule.hour = 18;
	moneyNotifRule.minute = 17;

	const sleepNotifRule = new schedule.RecurrenceRule();
	sleepNotifRule.hour = 21;
	sleepNotifRule.minute = 10;

	async function generateEatMessage(chatObj) {
		let chatTag = '';
		if (chatObj.tag) {
			chatTag = chatObj.tag;
		}
		return formatString(
			eatNotifString, chatObj.name, chatTag,
		);
	}

	schedule.scheduleJob(eatFirstNotifRule, async () => {
		const notifyArr = await db.collection('chats').find({
			state: true
		}).toArray();
		notifyArr.forEach(async (chats) => {
			const chatObj = await db.collection('chats').findOne({
				_id: chats._id
			});
			await bot.sendMessage(chats._id, await generateEatMessage(chatObj), {
				parse_mode: 'HTML'
			});
		});
	});

	schedule.scheduleJob(eatLastNotifRule, async () => {
		const notifyArr = await db.collection('chats').find({
			state: true
		}).toArray();
		notifyArr.forEach(async (chats) => {
			const chatObj = await db.collection('chats').findOne({
				_id: chats._id
			});
			const scheduledMsg = await bot.sendMessage(chats._id, await generateEatMessage(chatObj), {
				parse_mode: 'HTML'
			});
			bot.pinChatMessage(chats._id, scheduledMsg.message_id, {
				disable_notification: true
			});
		});
	});

	schedule.scheduleJob(moneyNotifRule, async () => {
		const notifyArr = await db.collection('chats').find({
			state: true
		}).toArray();
		notifyArr.forEach(async (chats) => {
			const scheduledMsg = await bot.sendMessage(chats._id, config.pinmsg.money, {
				parse_mode: 'HTML'
			});
			bot.pinChatMessage(chats._id, scheduledMsg.message_id);
		});
	});

	schedule.scheduleJob(sleepNotifRule, async () => {
		const notifyArr = await db.collection('chats').find({
			state: true
		}).toArray();
		notifyArr.forEach(async (chats) => {
			const scheduledMsg = await bot.sendMessage(chats._id, config.pinmsg.sleep, {
				parse_mode: 'HTML'
			});
			bot.pinChatMessage(chats._id, scheduledMsg.message_id, {
				disable_notification: true
			});
		});
	});
};