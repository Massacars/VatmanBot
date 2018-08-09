module.exports = (bot, config, db) => {

    const VatmanSay = config.vatmansay;
    const VatmanSayLenght = Object.keys(VatmanSay).length;

    function coinFlip() {
        return Math.round(Math.random() * (VatmanSayLenght - 0) + 0);
    };

    function coinHandFlip() {
        return (Math.floor(Math.random() * 2) === 0);
    };

    function messageList(array, lenght) {
        var phrasesList = '';
        for (i = 0; i < lenght; i++) {
            phrasesList = phrasesList + ('\nID:' + i + ' - ' + array[i]);
        }
        return phrasesList;
    };

    bot.onText(/^\/start$/, async function (msg) {
        const userId = msg.from.id;
        await bot.sendMessage(userId, config.phrases.hello);
    });

    bot.onText(/^\/info/, async function (msg) {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
            await bot.sendMessage(chatId, config.phrases.help);
        } else {
            await bot.sendMessage(userId, config.phrases.help);
        }
    });

    bot.onText(/\/ping/, async function (msg) {
        const msgId = msg.message_id;
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
            await bot.sendMessage(chatId, config.phrases.ping, { reply_to_message_id: msgId });
        } else if (msg.chat.type == 'private') {
            await bot.sendMessage(userId, config.phrases.ping, { reply_to_message_id: msgId });
        }
        console.log(msg);
    });

    bot.onText(/\/say/, async function (msg) {
        const msgId = msg.message_id;
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        var VatmanTalkMsgID = coinFlip();
        if (VatmanSay[VatmanTalkMsgID] != '' && VatmanSay[VatmanTalkMsgID]) {
            if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
                if (msg.reply_to_message) {
                    await bot.deleteMessage(chatId, messageId).catch((error) => {
                        if (!error.response.body.ok) {
                            bot.sendMessage(chatId, config.phrases.gimmeadmin);
                        }
                    });
                };
                await bot.sendMessage(chatId, VatmanSay[VatmanTalkMsgID], { reply_to_message_id: msgId });
            } else if (msg.chat.type == 'private') {
                await bot.sendMessage(userId, VatmanSay[VatmanTalkMsgID], { reply_to_message_id: msgId });
            }
        } else {
            if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
                await bot.sendMessage(chatId, config.phrases.error);
            } else if (msg.chat.type == 'private') {
                await bot.sendMessage(userId, config.phrases.error);
            }
        }
    });

    bot.onText(/^\/phrases$/, async function (msg) {
        const userId = msg.from.id;
        if (msg.chat.type == 'private') {
            await bot.sendMessage(userId, messageList(VatmanSay, VatmanSayLenght));
        }
    });

    bot.onText(/\/coin/, async function (msg) {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        if (coinHandFlip()) {
            if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
                await bot.sendMessage(chatId, config.phrases.eagle);
            } else if (msg.chat.type == 'private') {
                await bot.sendMessage(userId, config.phrases.eagle);
            }
        } else {
            if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
                await bot.sendMessage(chatId, config.phrases.noteagle);
            } else if (msg.chat.type == 'private') {
                await bot.sendMessage(userId, config.phrases.noteagle);
            }
        }
    });

    bot.onText(/^\/money/, async function (msg) {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
            moneyMessage = await bot.sendMessage(chatId, config.pinmsg.money, { parse_mode: "HTML" });
            bot.pinChatMessage(chatId, moneyMessage.message_id);
            bot.deleteMessage(chatId, messageId);
        }
    });

    bot.onText(/^\/eat/, async function (msg) {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
            eatMessage = await bot.sendMessage(chatId, config.pinmsg.eat, { parse_mode: "HTML" });
            bot.pinChatMessage(chatId, eatMessage.message_id);
            bot.deleteMessage(chatId, messageId);
        }
    });

    bot.onText(/^\/list$/, async function (msg) {
        const userId = msg.from.id;
        if (msg.chat.type == 'private') {
            await bot.sendMessage(userId, config.pinmsg.list);
        }
    });

    bot.onText(/^\/add_user$/, async function (msg) {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        if (msg.chat.type == 'private') {
            const userState = await db.collection('users').findOne({ _id: userId });
            if (userState) {
                await bot.sendMessage(chatId, "Пользователь <b>" + msg.chat.username + "</b> уже зарегистрирован!", { parse_mode: "HTML" });
            } else {
                const userData = {
                    _id: userId,
                    name: msg.from.first_name,
                    lastName: msg.from.last_name,
                    username: msg.from.username,
                    admin: false,
                    state: { active: true, sendMsg: false, sendLvl: true, sendMsgChat: "" }
                };
                result = await db.collection('users').insertOne(userData);
                if (result.result.ok) {
                    await bot.sendMessage(chatId, "Пользователь <b>" + msg.chat.username + "</b> добавлен!", { parse_mode: "HTML" });
                } else {
                    await bot.sendMessage(chatId, config.phrases.error);
                }
            }
        } else {
            await bot.sendMessage(chatId, "Не тут!");
        }
    });

    bot.onText(/^\/add_admin$/, async function (msg) {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        if (msg.chat.type == 'private') {
            const userState = await db.collection('users').findOne({ _id: userId });
            if (userState && userState.admin == true) {
                await bot.sendMessage(chatId, "Пользователь <b>" + msg.chat.username + "</b> уже администратор!", { parse_mode: "HTML" });
            } else if (userState && userState.admin != true) {
                result = await db.collection('users').updateOne({ _id: userId }, {
                    $set: { admin: true },
                });
                if (result.result.ok) {
                    await bot.sendMessage(chatId, "Пользователь <b>" + msg.chat.username + "</b> назначен админом!", { parse_mode: "HTML" });
                } else {
                    await bot.sendMessage(chatId, config.phrases.error);
                }
            } else {
                const userData = {
                    _id: userId,
                    name: msg.from.first_name,
                    lastName: msg.from.last_name,
                    username: msg.from.username,
                    admin: true,
                    state: { active: true, sendMsg: false, sendLvl: true, sendMsgChat: "" }
                };
                result = await db.collection('users').insertOne(userData);
                if (result.result.ok) {
                    await bot.sendMessage(chatId, "Пользователь <b>" + msg.chat.username + "</b> добавлен и назначен админом!", { parse_mode: "HTML" });
                } else {
                    await bot.sendMessage(chatId, config.phrases.error);
                }
            }
        } else {
            await bot.sendMessage(chatId, "Не тут!");
        }
    });

    bot.onText(/^\/add_chat/, async function (msg) {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        const userObj = await db.collection('users').findOne({ _id: userId });
        if (userObj) {
            admin = userObj.admin;
        } else {
            admin = false;
        };
        if (msg.chat.type == 'group' || msg.chat.type == 'supergroup' && admin == true) {
            const chatState = await db.collection('chats').findOne({ _id: chatId });
            if (chatState) {
                await bot.sendMessage(chatId, "Чат <b>" + msg.chat.title + "</b> уже подписан на уведомления", { parse_mode: "HTML" });
            } else {
                const chatData = {
                    _id: chatId,
                    name: msg.chat.title,
                    type: msg.chat.type,
                    tag: "",
                    state: true
                };
                result = await db.collection('chats').insertOne(chatData);
                if (result.result.ok) {
                    await bot.sendMessage(chatId, "Чат <b>" + msg.chat.title + "</b> добавлен в рассылку уведомлений!", { parse_mode: "HTML" });
                    await db.collection('users').updateMany({ _id: userId }, {
                        $set: {
                            'state.sendMsg': true,
                            'state.sendMsgChat': chatId,
                        },
                    });
                    await bot.sendMessage(chatId, "Введите тег чата:");
                } else {
                    await bot.sendMessage(chatId, config.phrases.error);
                };
            }
        } else {
            await bot.sendMessage(chatId, "Чаты может добавлять только админ... Пардон, Вы не админ!", { parse_mode: "HTML" });
        }
    });

    bot.on('message', async function (msg) {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        const userObj = await db.collection('users').findOne({ _id: userId });
        if (userObj) {
            if (userObj.state.sendMsg == true && chatId == userObj.state.sendMsgChat) {
                result = await db.collection('chats').updateOne({ _id: chatId }, {
                    $set: { tag: msg.text },
                });
                if (result.result.ok) {
                    await bot.sendMessage(chatId, "Тег для чата <b>" + msg.chat.title + "</b> установлен!", { parse_mode: "HTML" });
                } else {
                    await bot.sendMessage(chatId, config.phrases.error);
                };
                await db.collection('users').updateOne({ _id: userId }, {
                    $set: {
                        'state.sendMsg': false,
                        'state.sendMsgChat': "",
                    },
                });
            }
        };
    });

    bot.onText(/^\/test$/, async function (msg) {
        const chatId = msg.chat.id;
        const formatString = require('../util/formatString');
        const { eatNotifString } = require('../strings/chats-strings');
        const chatObj = await db.collection('chats').findOne({ _id: chatId });
        async function generateEatMessage(chatObj) {
            let chatTag = "";
            if (chatObj.tag) {
                chatTag = chatObj.tag;
            }
            return formatString(
                eatNotifString, chatObj.name, chatTag,
            );
        };
        await bot.sendMessage(chatId, await generateEatMessage(chatObj), { parse_mode: 'HTML' });
    });

    bot.onText(/^\/config/, async function (msg) {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        if (msg.chat.type == 'private') {
            const admin = await db.collection('users').findOne({ _id: userId, admin: true });
            if (admin) {
                let configText = JSON.stringify(config, null, 4);
                await bot.sendMessage(userId, configText.replace(/("token".*\n.*\n.*\n.*\n.*\n.*\n.*\n)/, ''), { parse_mode: 'HTML' });
            } else {
                await bot.sendMessage(userId, config.phrases.gimmeadmin, { parse_mode: 'HTML' });
            }
        } else {
            await bot.sendMessage(chatId, config.phrases.noway, { parse_mode: 'HTML' });
        }
    });

    bot.onText(/^\/helpmeplz/, async (msg) => {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Какой у тебя уровень боец?');
        const userObj = await db.collection('users').findOne({ _id: userId });
        if (userObj) {
            db.collection('users').updateOne({ _id: userId }, {
                $set: {
                    'state.sendLvl': true,
                    'state.sendMsgChat': chatId
                }
            });
        } else {
            let userOptions = {
                _id: userId,
                name: msg.from.first_name,
                lastName: msg.from.last_name,
                username: msg.from.username,
                admin: false,
                state: { active: true, sendMsg: false, sendLvl: true, sendMsgChat: chatId }
            };
            await db.collection('users').insertOne(userOptions);
        };
    });

    bot.onText(/^(\d{1,2})$/, async (msg, match) => {
        const text = match[1];
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        const username = msg.from.username
        const userObj = await db.collection('users').findOne({ _id: userId, 'state.sendLvl': true, 'state.sendMsgChat': chatId });
        if (userObj) {
            if (text > 2 && text <= 5) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl25, { parse_mode: 'Markdown' });
            };
            if (text > 5 && text <= 9) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl59, { parse_mode: 'Markdown' });
            };
            if (text > 9 && text <= 12) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl912, { parse_mode: 'Markdown' });
            };
            if (text > 12 && text <= 15) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl1215, { parse_mode: 'Markdown' });
            };
            if (text > 15 && text <= 18) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl1518, { parse_mode: 'Markdown' });
            };
            if (text > 18 && text <= 22) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl1822, { parse_mode: 'Markdown' });
            };
            if (text > 22 && text <= 26) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl2226, { parse_mode: 'Markdown' });
            };
            if (text > 26 && text <= 30) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl2630, { parse_mode: 'Markdown' });
            }; 
            if (text > 30 && text <= 35) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl3035, { parse_mode: 'Markdown' });
            };                                   
            if (text > 35 && text <= 38) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl3538, { parse_mode: 'Markdown' });
            };    
            if (text > 38 && text <= 42) {
                await bot.sendMessage(chatId, '@' + username + '\n' + config.guides.lvl3842, { parse_mode: 'Markdown' });
            };            
            if (text > 42) {
                await bot.sendMessage(chatId, '@' + username + '\nКак же достали эти старые #переточи...', { parse_mode: 'HTML' });
            };
            db.collection('users').updateOne({ _id: userId }, {
                $set: {
                    'state.sendLvl': false,
                    'state.sendMsgChat': ""
                }
            });
        }
    });

    bot.onText(/^👫Мы завершили командное задание/, async function (msg) {
        const msgId = msg.message_id;
        const chatId = msg.chat.id;
        const leaderId = config.team.SM.leader;
        if (leaderId == msg.from.id) {
            await bot.pinChatMessage(chatId, msgId);
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
            await bot.pinChatMessage(chatId, msgId);
            await bot.sendMessage(chatId, config.phrases.loosers, { parse_mode: 'HTML' });
        } else {
            await bot.sendMessage(chatId, config.phrases.notyou, { parse_mode: 'HTML' });
        }
    });
}