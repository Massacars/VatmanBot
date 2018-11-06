module.exports = (schedule, bot, config) => {
	const fightNotifRule = new schedule.RecurrenceRule();
	fightNotifRule.hour = 17;
	fightNotifRule.minute = '00';

	schedule.scheduleJob(fightNotifRule, async () => {
		const chatId = config.team.SM.id;
		const scheduledMsg = await bot.sendMessage(chatId, config.pinmsg.fight, { parse_mode: 'HTML' });
		bot.pinChatMessage(chatId, scheduledMsg.message_id);
	});
};