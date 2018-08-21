module.exports = (bot, config, db) => {

    bot.onText(/Твои результаты в битве на \d{2} часов: @startupwarsreport/, async function (msg) {
        if (msg.forward_from || (msg.forward_from.username === 'StartupWarsBot' || msg.forward_from.username === 'StartupWars01Bot')) {
            const msgId = msg.message_id;
            const msgText = msg.text;
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            const msgDate = msg.forward_date;
            const dateNow = Math.floor(Date.now() / 1000);

            if (msgText.match(/💵Деньги: -\$(.*)/)) {
                if (dateNow - msgDate < 72000) {
                    const match = msgText.match(/💵Деньги: -\$(.*)/);
                    const clearMatch = match[1];
                    const money = +clearMatch;
                    const userObj = await db.collection('users').findOne({ _id: userId });

                    if (userObj) {
                        const topml = userObj.tops.hasOwnProperty('topml');
                        const date = userObj.tops.hasOwnProperty('date');
                        let summ = 0;
                        let forwardDate = new Date();

                        summ = (!topml) ? summ = +money : summ = +money + userObj.tops.topml;
                        forwardDate = (!date) ? forwardDate = dateNow : forwardDate = userObj.tops.date;
                        if (msgDate == forwardDate) {
                            await bot.sendMessage(chatId, config.topmsg.reportready, { reply_to_message_id: msgId });
                        } else {
                            await db.collection('users').updateOne({ _id: userId }, {
                                $set: {
                                    tops: {
                                        topml: summ,
                                        date: msgDate,
                                    },
                                    division: msg.chat.id,
                                }
                            });
                            await bot.sendMessage(chatId, config.topmsg.report, { reply_to_message_id: msgId });
                        }
                    } else {
                        const userData = {
                            _id: userId,
                            name: msg.from.first_name,
                            lastName: msg.from.last_name,
                            username: '@' + msg.from.username,
                            admin: false,
                            division: msg.chat.id,
                            state: { active: true, sendMsg: false, sendLvl: false, sendMsgChat: "" },
                            tops: { topml: money, date: msgDate }
                        };
                        await db.collection('users').insertOne(userData);
                        await bot.sendMessage(chatId, config.topmsg.report, { reply_to_message_id: msgId });
                    }
                } else {
                    await bot.sendMessage(chatId, config.topmsg.oldreport, { reply_to_message_id: msgId });
                }
            }
        }
    });

    bot.onText(/\/tops/, async function (msg) {
        const chatId = msg.chat.id;
        if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
            bot.sendMessage(chatId, "Список топов:\n\n💵 Топ неудачных инвесторов - /topml (добавить - /add_topml)");
        }
    });

    bot.onText(/\/add_topml/, async function (msg) {
        const chatId = msg.chat.id;
        if (msg.chat.type == 'qroup' || msg.chat.type == 'supergroup') {
            const chatObj = await db.collection('chats').findOne({ _id: chatId });
            if (chatObj) {
                await db.collection('chats').updateOne({ _id: chatId }, {
                    $set: {
                        tops: {
                            topml: true
                        }
                    }
                });
                await bot.sendMessage(chatId, config.topmsg.topactive);
            } else {
                await bot.sendMessage(chatId, config.topmsg.chatinactive);
            }
        }
    });

    bot.onText(/\/topml/, async function (msg) {
        const chatId = msg.chat.id;
        const chatObj = await db.collection('chats').findOne({ _id: chatId });
        const chatActive = (chatObj) ? chatObj.tops.hasOwnProperty('topml') : false;

        if (chatActive) {
            const topmlArr = await db.collection('users').find({ "tops.topml": { $gt: 0 }, division: chatId }).sort({ "tops.topml": -1 }).toArray();
            if (topmlArr.length >= 1) {
                let topStr = "";
                let i = 1;
                topmlArr.sort().forEach(async (topml) => {
                    switch (i) {
                        case 1:
                            top = '🥇  ';
                            break;
                        case 2:
                            top = '🥈  ';
                            break;
                        case 3:
                            top = '🥉  ';
                            break;
                        default:
                            top = 'i  ';
                            break;
                    };
                    topStr = topStr + '▪️' + top + '<b>' + topml.username + '</b>' + '   -' + topml.tops.topml + '💵\n';
                    i++;
                })
                await bot.sendMessage(chatId, '💰 Топ горе-инвесторов:\n\n' + topStr, {parse_mode: 'HTML'});
            } else {
                await bot.sendMessage(chatId, config.topmsg.empty);
            }
        } else {
            await bot.sendMessage(chatId, config.topmsg.topinactive);
        }
    })
}