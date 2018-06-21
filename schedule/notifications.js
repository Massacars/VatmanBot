module.exports = (schedule, bot, config, db) => {
	const formatString = require('../util/formatString');
	const { eatNotifString } = require('../strings/chats-strings');

	const eatFirstNotifRule = new schedule.RecurrenceRule();
	const eatLastNotifRule = new schedule.RecurrenceRule();
	const moneyNotifRule = new schedule.RecurrenceRule();
	eatFirstNotifRule.hour = [9, 12, 15, 18, 21];
	eatFirstNotifRule.minute = 46;
	eatLastNotifRule.hour = [10, 13, 16, 19, 22];
	eatLastNotifRule.minute = 15;
	moneyNotifRule.hour = 19;
	moneyNotifRule.minute = 17;
	
	async function generateEatMessage(chatObj) {
		let chatTag = "";
		if (chatObj.tag) {
			chatTag = chatObj.tag;
		}
		return formatString(
			eatNotifString, chatObj.name, chatTag,
		);
	};

	schedule.scheduleJob(eatFirstNotifRule, async () => {
		const notifyArr = await db.collection('chats').find({ state: true }).toArray();
		notifyArr.forEach(async (chats) => {
			const chatObj = await db.collection('chats').findOne({ _id: chats._id });
			await bot.sendMessage(chats._id, await generateEatMessage(chatObj), { parse_mode: "HTML" });
		});
	});

	schedule.scheduleJob(eatLastNotifRule, async () => {
		const notifyArr = await db.collection('chats').find({ state: true }).toArray();
		notifyArr.forEach(async (chats) => {
			const chatObj = await db.collection('chats').findOne({ _id: chats._id });
			scheduledMsg = await bot.sendMessage(chats._id, await generateEatMessage(chatObj), { parse_mode: "HTML" });
			bot.pinChatMessage(chats._id, scheduledMsg.message_id, { disable_notification: true });
		});
	});

	schedule.scheduleJob(moneyNotifRule, async () => {
		const notifyArr = await db.collection('chats').find({ state: true }).toArray();
		notifyArr.forEach(async (chats) => {			
			scheduledMsg = await bot.sendMessage(chats._id, config.pinmsg.money, { parse_mode: "HTML" });
			bot.pinChatMessage(chats._id, scheduledMsg.message_id);
		});
	});
}