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
            state: 'active',
            options: {
                first_option: answers[0][0],
                second_option: answers[1][1]
            },
            vote: {}
        }
        await db.collection('polls').insertOne(optionData);
        pollKeyboard = await db.collection('polls').findOne({ chatId: chatId, state: 'active' });
        pollMessage = await bot.sendMessage(chatId, decs, { reply_markup: { inline_keyboard: pollKeyboard.keyboard }, parse_mode: "HTML" });
        await bot.pinChatMessage(chatId, pollMessage.message_id);
    };

    async function updatePoll(chatId, msgId) {
        pollObj = await db.collection('polls').findOne({ chatId: chatId, state: 'active' })
        votesObj = pollObj.vote;
        var firstOptionSummary = 0;
        var secondOptionSummary = 0;
        for (key in votesObj) {
            if (votesObj[key][0] == 'first_option') {
                firstOptionSummary = firstOptionSummary + 1;
            }
            if (votesObj[key][0] == 'second_option') {
                secondOptionSummary = secondOptionSummary + 1;
            }
        }
        firstOptionText = pollObj.options.first_option;
        secondOptionText = pollObj.options.second_option;
        votesFіrstOptionText = "За квест:\n <b>" + firstOptionText + "</b>\n<b>" + firstOptionSummary + "</b> бездельников.. ой сотрудников\n";
        votesSecondOptionText = "За квест:\n <b>" + secondOptionText + "</b>\n<b>" + secondOptionSummary + "</b> бездельников.. ой сотрудников\n";
        messageText = await db.collection('polls').findOne({ chatId: chatId, state: 'active' });
        newMessageText = messageText.title + "\n\n" + votesFіrstOptionText + "\n" + votesSecondOptionText;
        pollKeyboard = await db.collection('polls').findOne({ chatId: chatId, state: 'active' });
        await bot.editMessageText(newMessageText, { message_id: msgId, chat_id: chatId, reply_markup: { inline_keyboard: pollKeyboard.keyboard }, parse_mode: "HTML" });
    }

    async function checkUserVote(chatId, userId) {
        pollObj = await db.collection('polls').findOne({ chatId: chatId, state: 'active' });
        if (userId in pollObj.vote) {
            return true;
        } else {
            return false;
        }
    }

    bot.onText(/Командные задания/, async function (msg) {
        const chatId = msg.chat.id;
        const msgId = msg.message_id;
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

        const desc = config.textmsq.teamQuestPoll + "\n1) " + pollOptions[0][0] + "\n2) " + pollOptions[1][1];
        chatPollState = await db.collection('polls').findOne({ chatId: chatId, state: "active" });
        if (chatPollState) {
            await db.collection('polls').updateMany({ chatId: chatId }, {
                $set: {
                    keyboard: '',
                    state: 'disabled'
                }
            });
            await bot.sendMessage(chatId, config.textmsq.teamQuestPollReopen);
            await createPoll(chatId, desc, pollOptions);
        } else {            
            await createPoll(chatId, desc, pollOptions);
        };
        await bot.deleteMessage(chatId, msgId);

    });

    bot.on('callback_query', async function (query) {
        const userId = query.from.id;
        const chatId = query.message.chat.id;
        const msgId = query.message.message_id;
        const queryId = query.id;
        const queryData = query.data;

        checkVote = await checkUserVote(chatId, userId);
        if (!checkVote) {
            await db.collection('polls').update({ chatId: chatId, state: 'active' }, {
                $push: {
                    [`vote.${userId}`]: queryData
                }
            });
            await bot.answerCallbackQuery(queryId, { text: config.textmsq.vote });
            await updatePoll(chatId, msgId);
        } else {
            await bot.answerCallbackQuery(queryId, { text: config.textmsq.cheater });
        }
    });
}