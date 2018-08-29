process.env["NTBA_FIX_319"] = 1;

const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const requireFu = require('require-fu'); 
const Scheduler = require('node-schedule');
const MongoClient = require('mongodb').MongoClient;
const bot = new TelegramBot(config.token, { polling: true });

// Connection URL
const url = 'mongodb://' + config.db.user + ':' + config.db.password + '@' + config.db.host + ':' + config.db.port + '/' + config.db.database; 
 
// Database Name
const dbName = config.db.database;

// Use connect method to connect to the server
MongoClient.connect(url, async function(err, client) {

	console.log("Connected successfully to server");

	const db = client.db(dbName);

	requireFu(`${__dirname}/commands`)(bot, config, db);
	requireFu(`${__dirname}/schedule`)(Scheduler, bot, config, db);
	requireFu(`${__dirname}/polls`)(bot, config, db);
	requireFu(`${__dirname}/triggers`)(bot, config, db);
	requireFu(`${__dirname}/tops`)(bot, config, db);

	process.on('SIGINT', async () => {
		await client.close(false);
		process.exit();
	});	
});