module.exports = (bot, config, db) => {

    async function createPoll(chatId, decs, answers){

        var pollKeyboard = [
            [{ text: answers[0][0], callback_data: 'first_option' }],
            [{ text: answers[1][1], callback_data: 'second_option' }]
        ]
        
        await bot.sendMessage(chatId, decs, { reply_markup: { inline_keyboard: pollKeyboard } });

    };    

    bot.onText(/Командные задания/, async function (msg) {
        const chatId = msg.chat.id;
        const pollData = msg.text;
        const arrayPollData = pollData.split('\n\n');
        const pollOptions = [];
        var j = 0;

        for (i = 0; i < arrayPollData.length; i++) {
            if (arrayPollData[i].match(/\/ts_.*_hard/)) {                
                pollOptions[j] = arrayPollData[i].match(/^(.*)\./);
                j = j+1;                
            }
        };       

        createPoll(chatId, "Командные задания", pollOptions);

    });

    bot.on('callback_query', async function (msg) {
        const userId = msg.from.id;
        const chatId = msg.message.chat.id;
        const pollId = msg.id;
        const messageText = msg.message.text;
        const messageId = msg.message.message_id;

        if (msg.data == 'first_option') {
            const userCheck = await db.collection('polls').findOne({_id: pollId, user: userId });

            if (!userCheck) {
                await bot.sendMessage(chatId, "Типу перший варіант");
                const optionData = {
                    _id: msg.id,
                    user: msg.from.id,
                    option: 'first_option'
                }
                await db.collection('polls').insertOne(optionData);               
            }
        };

        if (msg.data == 'second_option') {
            const userCheck = await db.collection('polls').findOne({_id: pollId, user: userId });
           
            if (!userCheck) {
                await bot.sendMessage(chatId, "Типу другий варіант");
                const optionData = {
                    _id: msg.id,
                    user: msg.from.id,
                    option: 'second_option'
                }
                await db.collection('polls').insertOne(optionData);
            }
        };

        const votesFirstOption = await db.collection('polls').find({_id: pollId, option: 'first_option' }).toArray();

        votesFіrstOptionText = "За первый квест: " + votesFirstOption.length + "сотрудник (ов)";

        const votesSecondOption = await db.collection('polls').find({_id: pollId, option: 'first_option' }).toArray();

        votesSecondOptionText = "За второй квест: " + votesSecondOption.length + "сотрудник (ов)";        
           
        newMessageText = messageText + "\n\n" + votesFіrstOptionText + "\n" + votesSecondOptionText;        

        await bot.editMessageText(newMessageText, {chat_id: chatId, message_id: messageId});

    });
}