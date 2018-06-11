const mysql = require('mysql');

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
