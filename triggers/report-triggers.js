module.exports = (bot, config, db) => {

    bot.onText(/Твои результаты в битве на \d{2} часов: @startupwarsreport/, async function (msg) {
        const chatId = msg.chat.id;
        const msgId = msg.message_id;
        const msgText = msg.text;
        money = msgText.match(/💵Деньги: (.*)/);
        points = msgText.match(/🏆Твой вклад: \+(.*)/);
        if (money[1] == 0 && (msg.forward_from.username === 'StartupWarsBot' || msg.forward_from.username === 'StartupWars01Bot')) {
            await bot.sendDocument(chatId, config.files.fire, { caption: config.textmsg.moneyCaption, reply_to_message_id: msgId });
        };
        if (points[1] > 10000 && (msg.forward_from.username === 'StartupWarsBot' || msg.forward_from.username === 'StartupWars01Bot')) {
            await bot.sendDocument(chatId, config.files.uber, { caption: config.textmsg.vatmanCaption, reply_to_message_id: msgId });
        };
    });

}