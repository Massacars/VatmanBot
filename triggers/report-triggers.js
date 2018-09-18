module.exports = (bot, config, db) => {

    bot.onText(/Твои результаты в битве на \d{2} часов: @startupwarsreport/, async function (msg) {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        const msgId = msg.message_id;
        const msgText = msg.text;
        const money = msgText.match(/💵Деньги: (.*)/);
        const points = msgText.match(/🏆Твой вклад: \+(.*)/);
       
        if (money && (money[1] == 0 && (msg.forward_from.username === 'StartupWarsBot' || msg.forward_from.username === 'StartupWars01Bot'))) {
            await bot.sendDocument(chatId, config.files.fire, { caption: config.textmsg.moneyCaption, reply_to_message_id: msgId });
        };
        if (points && (points[1] > 100 && (msg.forward_from.username === 'StartupWarsBot' || msg.forward_from.username === 'StartupWars01Bot'))) {
            if(userId == config.vatman){
                await bot.sendMessage(chatId, config.phrases.vatmanlooser, { reply_to_message_id: msgId });
            } else {
                await bot.sendDocument(chatId, config.files.uber, { caption: config.textmsg.vatmanCaption, reply_to_message_id: msgId });
            }            
        };
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
}