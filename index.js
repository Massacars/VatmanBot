const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const mysql = require('mysql');

const bot = new TelegramBot(config.token, { polling: true });
const VatmanSay = config.vatmansay;
const VatmanSayLenght = Object.keys(VatmanSay).length;

const connection = mysql.createConnection({
	host     : config.db.host,
	user     : config.db.user,
	password : config.db.password,
	database : config.db.database
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  } 
  console.log('connected as id ' + connection.threadId);
});

var UserData = {
	user: '',
	state: '0'
};

// Functions

function coinFlip() {
	return Math.round(Math.random() * (VatmanSayLenght - 0) + 0);
};

function coinHandFlip() {
	return (Math.floor(Math.random() * 2) === 0);
};

function messageList(array, lenght){
	var phrasesList = '';
	for (i = 0; i < lenght; i++){
		phrasesList = phrasesList + ('\nID:'+ i + ' - ' + array[i]);
	}
	return phrasesList;
};

function userlist(array, lenght){
	var stringUserList = '';
	if(!lenght){
		stringUserList = stringUserList + ('\nID: 1 ' + array[0].username + ' Name: ' + array[0].first_name);
	} else {
		for (i = 0; i < lenght; i++){
			stringUserList = stringUserList + ('\nID:'+ i + ' - ' + array[i].username + ' Name: ' + array[i].first_name);
			console.log(stringUserList);
		}
	}
	return stringUserList;
};	

// Commands

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
		await bot.sendMessage(userId, messageList(VatmanSay, VatmanSayLenght));
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

// Game

bot.onText(/\/reg/, async function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;

	if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {

		const userName = msg.from.first_name;
		const userLastName = msg.from.last_name;
		const username = msg.from.username;

		connection.query('SELECT `state` FROM `users` WHERE `username` = "' + username + '" and `chat_id` = "' + chatId + '"', async function (error, results, fields) {
			if(results[0]){		
				if(results[0].state == 0){
					await bot.sendMessage(chatId, config.phrases.gameover);
				}else{
					await bot.sendMessage(chatId, config.phrases.gameready);
				}
			} else {
				connection.query("INSERT INTO `users` (`id`, `chat_id`,`username`, `first_name`, `last_name`, `state`) VALUES (NULL, '" + chatId + "', '" + username + "', '" + userName + "', '" + userLastName + "', '1');", async function (error, results, fields) {
					if (error) throw error;
					await bot.sendMessage(chatId, config.phrases.gamestart);
				});							
			}
		});
	}
});

bot.onText(/\/list/, async function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;

	if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
		connection.query('SELECT * FROM `users` WHERE `chat_id` = "' + chatId + '"', async function (error, results, fields) {
			console.log(results);			
			await bot.sendMessage(chatId, userlist(results, Object.keys(results).length));
		});				
	}
});

// Hashtags

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