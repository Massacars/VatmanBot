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

module.exports = (bot, config) => {

const VatmanSay = config.vatmansay;
const VatmanSayLenght = Object.keys(VatmanSay).length;

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

	bot.onText(/\/money/, async function(msg, match) {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		const messageId = msg.message_id;
		if (msg.chat.type == 'group' || msg.chat.type == 'supergroup'){
			moneyMessage = await bot.sendMessage(chatId, "В @StartupWarsChat началась лотерея!🕸\n\n*Сеть->🎪Казино->🤑Лотерея* \n\nРезультаты будут в чате в 21:15🎉", {parse_mode:"Markdown"});			
			bot.pinChatMessage(chatId, moneyMessage.message_id);
			bot.deleteMessage(chatId, messageId);
		}
	});

	bot.onText(/\/eat/, async function(msg, match) {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		const messageId = msg.message_id;
		if (msg.chat.type == 'group' || msg.chat.type == 'supergroup'){
			warnMessage = await bot.sendMessage(chatId, "Сотрудники Отдела Маркетинга <b>[ОМ]</b> 🍕  \n\n Огромная просьба: \n\n🗄 Обновить данные: \n/compact, /stock => @HendricksBot \n\n🔋 Регулярно кушать:\n/to_eat => пока не будет <b>200</b>. \n\n✏️ По желанию: \n/setname => Добавить в конце тег <b>-OM-</b> \n\nСпасибо за внимание. \n/AVE_PP \n/AVE_OM", {parse_mode:"HTML"});
			bot.pinChatMessage(chatId, warnMessage.message_id);
			bot.deleteMessage(chatId, messageId);
		}
	});

	bot.onText(/\/list/, async function(msg, match) {
		const userId = msg.from.id;
		const chatId = msg.chat.id;
		
		if (msg.chat.type == 'private') {		
			await bot.sendMessage(userId, "/phrases - Список фраз для команди /say \n/money - Пін на лотерею\n/eat - Пін на репорти та їжу");
		}
	});

}

