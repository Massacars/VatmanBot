module.exports = (schedule, bot, config, db) => {
	const fightNotifRule = new schedule.RecurrenceRule();
	const settings = config.teamSettings.notification;
	fightNotifRule.hour = settings.hour;
	fightNotifRule.minute = settings.minute;

	schedule.scheduleJob(fightNotifRule, async () => {
		const notifyArr = await db
			.collection('teams')
			.find({
				state: true
			})
			.toArray();
		notifyArr.forEach(async chats => {
			const scheduledMsg = await bot.sendMessage(
				chats._id,
				config.pinmsg.fight,
				{
					parse_mode: 'HTML'
				}
			);
			bot.pinChatMessage(chats._id, scheduledMsg.message_id);
		});
	});
};
