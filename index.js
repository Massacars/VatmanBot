var TelegramBot = require('node-telegram-bot-api');
var token = '489923789:AAH5WyDngJZCxmgvp207ND-6OaxPFcEtMxY';
var bot = new TelegramBot(token, { polling: true });

var UserData = {
	user:'',
	state:'0'
};

var VatmanTalk = ['Ну камон... Я ж нажав..','Та все окей)','А хто придумав ьі ...','Фу. Лузери!','А потім приїжджаєш в Україну львівським метром 🌝','Ботінки херня. Можна і босим походити) 🌝','Аби ще якась * не перепінила через хвилину...)','Ну да, ну да) не баг, а фіча','Шо за ноунейми...','І поскидував репорти за день, він каже "все ок, опрацьовано". Але хісторі не змінилася. Сука двулика.','Ты выгнал игрока 📯Alex Stardust (45) из команды.','Вітаємо в сєкті.','#переточ','⚔️Атака: -1 🛡Защита: 12.. Я монстр!'];

function coinFlip() {  
  return Math.round(Math.random() * (VatmanTalk.length - 0) + 0);
}

function coinHandFlip() {
  return (Math.floor(Math.random() * 2) === 0);
}

bot.onText(/\/start/, function(msg, match){
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	bot.sendMessage(userId,'А дійсно...');
});

bot.onText(/\/help/, function(msg, match){
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	bot.sendMessage(userId,'Поки в мене є тільки /ping , /say та /coin, але я навчусь більше!');
});

bot.onText(/\/ping/, function(msg, match){
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	
	if(msg.chat.type == 'group' || msg.chat.type == 'supergroup'){
		bot.sendMessage(chatId,'Pong');
	} else if (msg.chat.type == 'private'){
		bot.sendMessage(userId,'Pong');	
	}
	
});

bot.onText(/\/say/, function(msg, match) {
	const userId = msg.from.id;
	const chatId = msg.chat.id;

	if (coinFlip() > VatmanTalk.length) {
		var VatmanTalkMsgID = coinFlip() - 1;
	} else {
		var VatmanTalkMsgID = coinFlip();
	}

	if (VatmanTalk[VatmanTalkMsgID] != '') {
		if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
			bot.sendMessage(chatId, VatmanTalk[VatmanTalkMsgID]);
		} else if (msg.chat.type == 'private') {
			bot.sendMessage(userId, VatmanTalk[VatmanTalkMsgID]);
		}
	} else {
		if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
			bot.sendMessage(chatId, 'Уууу.. Щось пішло не так..');
		} else if (msg.chat.type == 'private') {
			bot.sendMessage(userId, 'Уууу.. Щось пішло не так..');
		}
	}
});

bot.onText(/\/coin/, function(msg, match){
	const userId = msg.from.id;
	const chatId = msg.chat.id;
	
	if(coinHandFlip()){
		if(msg.chat.type == 'group' || msg.chat.type == 'supergroup'){
			bot.sendMessage(chatId,'Юний Орел');
		} else if (msg.chat.type == 'private'){
			bot.sendMessage(userId,'Юний Орел');	
		}		
	} else {
		if(msg.chat.type == 'group' || msg.chat.type == 'supergroup'){
			bot.sendMessage(chatId,'Не Орел');
		} else if (msg.chat.type == 'private'){
			bot.sendMessage(userId,'Не Орел');	
		}			
	}	
});