module.exports = (bot, config, db) => {

    async function createPoll(chatId, decs, answers) {
        pollKeyboardData = [
            [{ text: answers[0][0], callback_data: 'first_option' }],
            [{ text: answers[1][1], callback_data: 'second_option' }]
        ]
        optionData = {
            chatId: chatId,
            keyboard: pollKeyboardData,
            title: decs,
            state: 'active'
        }
        await db.collection('polls').insertOne(optionData);
        pollKeyboard = await db.collection('polls').findOne({ chatId: chatId, state: 'active' });
        await bot.sendMessage(chatId, decs, { reply_markup: { inline_keyboard: pollKeyboard.keyboard }, parse_mode: "HTML" });
    };

    async function updatePoll(chatId, msgId, userId) {
        votesFirstOption = await db.collection('polls').find({ chatId: chatId, state: 'active', 'votes.pollOption': 'first_option' }).toArray();
        votesFіrstOptionText = "За первый квест: " + votesFirstOption.length + " сотрудник (ов)";

        votesSecondOption = await db.collection('polls').find({ сhatId: chatId, state: 'active', 'votes.pollOption': 'second_option' }).toArray();
        votesSecondOptionText = "За второй квест: " + votesSecondOption.length + " сотрудник (ов)";

        messageText = await db.collection('polls').findOne({ chatId: chatId, state: 'active' });
        newMessageText = messageText.title + "\n\n" + votesFіrstOptionText + "\n" + votesSecondOptionText;

        pollKeyboard = await db.collection('polls').findOne({ chatId: chatId, state: 'active' });
        await bot.editMessageText(newMessageText, { message_id: msgId, chat_id: chatId, reply_markup: { inline_keyboard: pollKeyboard.keyboard }, parse_mode: "HTML"});
    }

    bot.onText(/Командные задания/, async function (msg) {
        const chatId = msg.chat.id;
        const sourceMsgText = msg.text;
        const arrayPollData = sourceMsgText.split('\n\n');
        const pollOptions = [];
        var j = 0;

        for (i = 0; i < arrayPollData.length; i++) {
            if (arrayPollData[i].match(/\/ts_.*_hard/)) {
                pollOptions[j] = arrayPollData[i].match(/^(.*)\./);
                j = j + 1;
            }
        };

        chatPollState = await db.collection('polls').findOne({ chatId: chatId, state: "active" });
        if (chatPollState) {
            await db.collection('polls').updateMany({ chatId: chatId }, {
                $set: {
                    keyboard: '',
                    state: 'disabled'
                }
            });
            await bot.sendMessage(chatId, 'Предыдущее голосование закрыто. Открываем новое!');
            createPoll(chatId, config.textmsq.teamQuestPoll, pollOptions);
        } else {
            createPoll(chatId, config.textmsq.teamQuestPoll, pollOptions);
        };
    });

    bot.on('callback_query', async function (query) {
        const userId = query.from.id;
        const chatId = query.message.chat.id;
        const msgId = query.message.message_id;
        const queryId = query.id;        
        const queryData = query.data;

        if (queryData == 'first_option') {
            userCheck = await db.collection('polls').findOne({ chatId: chatId, 'votes.user': userId, state: 'active' });
            if (!userCheck) {
                await db.collection('polls').updateOne({ chatId: chatId, state: 'active' }, {
                    $set: {
                        votes: {
                            userId:{                                
                                pollOption: 'first_option'
                           }
                        }
                    }
                });
                await bot.answerCallbackQuery(queryId, { text: "Голос принят!" });
                updatePoll(chatId, msgId, userId);
            } else {
                await bot.answerCallbackQuery(queryId, { text: "Ты что НОН!?" })
            };
        };

        if (queryData == 'second_option') {
            userCheck = await db.collection('polls').findOne({ chatId: chatId, 'votes.user': userId, state: 'active' });
            if (!userCheck) {
                await db.collection('polls').updateOne({ chatId: chatId, state: 'active' }, {
                    $set: {
                        votes: {
                            user: userId,
                            pollOption: 'second_option'
                        }
                    }
                });
                await bot.answerCallbackQuery(queryId, { text: "Голос принят!" });
                updatePoll(chatId, msgId);
            } else {
                await bot.answerCallbackQuery(queryId, { text: "Ты что НОН?!" })
            };
        };
    });
}