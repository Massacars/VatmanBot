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

    bot.on('callback_query', async function (query) {
        const userId = query.from.id;
        const chatId = query.message.chat.id;
        const pollId = query.chat_instance;
        const queryId = query.id;
        const userFormQuery = query.from.id;
        const messageText = query.message.text;
        const messageId = query.message.message_id;
        const queryData = query.data;

        console.log(query);

        if (queryData == 'first_option') {
            const userCheck = await db.collection('polls').findOne({_id: pollId, user: userId });

            if (!userCheck) {                
                const optionData = {
                    _id: pollId,
                    user: userFormQuery,
                    option: 'first_option'
                }
                await db.collection('polls').insertOne(optionData);
                await bot.answerCallbackQuery(queryId, {text: "Голос принят!"})               
            }else{
                await bot.answerCallbackQuery(queryId, {text: "Читер!"})
            }
        };

        if (queryData == 'second_option') {
            const userCheck = await db.collection('polls').findOne({_id: pollId, user: userId });
           
            if (!userCheck) {                
                const optionData = {
                    _id: pollId,
                    user: userFormQuery,
                    option: 'second_option'
                }
                await db.collection('polls').insertOne(optionData);
                await bot.answerCallbackQuery(queryId, {text: "Голос принят!"})               
            }else{
                await bot.answerCallbackQuery(queryId, {text: "Читер!"})
            }
        };

        const votesFirstOption = await db.collection('polls').find({_id: pollId, option: 'first_option' }).toArray();

        votesFіrstOptionText = "За первый квест: " + votesFirstOption.length + "сотрудник (ов)";

        const votesSecondOption = await db.collection('polls').find({_id: pollId, option: 'second_option' }).toArray();

        votesSecondOptionText = "За второй квест: " + votesSecondOption.length + "сотрудник (ов)";        
           
        newMessageText = messageText + "\n\n" + votesFіrstOptionText + "\n" + votesSecondOptionText;        

        await bot.sendMessage(chatId, newMessageText);        

    });
}