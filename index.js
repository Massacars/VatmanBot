const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const bot = new TelegramBot(config.token, { polling: true });
const VatmanSay = config.vatmansay;
const VatmanSayLenght = Object.keys(VatmanSay).length;

var UserData = {
	user: '',
	state: '0'
};

function coinFlip() {
	return Math.round(Math.random() * (VatmanSayLenght - 0) + 0);
}

function coinHandFlip() {
	return (Math.floor(Math.random() * 2) === 0);
}

bot.onText(/\/start/, async function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	await bot.sendMessage(userId, config.phrases.hello);
});

bot.onText(/\/help/, async function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
		await bot.sendMessage(chatId, config.phrases.help);
	} else {
		await bot.sendMessage(userId, config.phrases.help);
	}
});

bot.onText(/\/ping/, async function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
		await bot.sendMessage(chatId, config.phrases.ping);
	} else if (msg.chat.type == 'private') {
		await bot.sendMessage(userId, config.phrases.ping);
	}
});

bot.onText(/\/say/, async function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	const messageId = msg.message_id;
	var VatmanTalkMsgID = coinFlip();
	if (VatmanSay[VatmanTalkMsgID] != '' && VatmanSay[VatmanTalkMsgID]) {
		if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {			
			if (msg.reply_to_message) {				
				await bot.deleteMessage(chatId, messageId).catch((error) => {			
					if(!error.response.body.ok){
						bot.sendMessage(chatId, config.phrases.gimmeadmin);
					}										
				});
				
			};
			await bot.sendMessage(chatId, VatmanSay[VatmanTalkMsgID]);
		} else if (msg.chat.type == 'private') {
			await bot.sendMessage(userId, VatmanSay[VatmanTalkMsgID]);
		}
	} else {
		if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
			await bot.sendMessage(chatId, config.phrases.error);
		} else if (msg.chat.type == 'private') {
			await bot.sendMessage(userId, config.phrases.error);
		}
	}
});

bot.onText(/\/phrases/, async function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	
	if (msg.chat.type == 'private') {
		for (i = 0; i < VatmanSayLenght; i++){
			await bot.sendMessage(userId, 'ID:'+ i + ' - ' + VatmanSay[i]);
		}
	}
});

bot.onText(/\/coin/, async function(msg, match) {
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

bot.onText(/\#ватфразочка/, async function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	const userName = msg.from.first_name;
	const userLastName = msg.from.last_name;
	const username = msg.from.username;
	const chatTitle = msg.chat.title;
	const text = msg.text;
	await bot.sendMessage(config.admin, userName + ' ' + userLastName + ' / ' + username + ' Чат: ' + chatTitle + ' Фраза: ' + text);
	await bot.sendMessage(chatId, config.phrases.ty);
});

bot.onText(/\#ватідея/, async function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	const userName = msg.from.first_name;
	const userLastName = msg.from.last_name;
	const username = msg.from.username;
	const chatTitle = msg.chat.title;
	const text = msg.text;
	await bot.sendMessage(config.admin, userName + ' ' + userLastName + ' / ' + username + ' Чат: ' + chatTitle + ' Ідея: ' + text);
	await bot.sendMessage(chatId, config.phrases.ty);
});