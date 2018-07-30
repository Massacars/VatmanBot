module.exports = (schedule, bot, config, db) => {
    const fightNotifRule = new schedule.RecurrenceRule();
    fightNotifRule.hour = 18;
    fightNotifRule.minute = 00;

    schedule.scheduleJob(fightNotifRule, async () => {
        const chatId = config.team.SM.id;
        scheduledMsg = await bot.sendMessage(chatId, config.pinmsg.fight, { parse_mode: "HTML" });
        bot.pinChatMessage(chatId, scheduledMsg.message_id);
    });
}