const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const requireFu = require('require-fu');
const Scheduler = require('node-schedule');
const MongoClient = require('mongodb').MongoClient;
const bot = new TelegramBot(config.token, { polling: true });

// Connection URL
const url = `mongodb+srv://${config.db.user}:${
	config.db.password
}@vatmanbot-a1hux.mongodb.net/test?retryWrites=true&w=majority`;

// Database Name
const dbName = config.db.database;

// Use connect method to connect to the server
MongoClient.connect(
	url,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	async function(err, client) {
		if (err) {
			console.log('MongoClient.connect err:', err.message);
			return;
		} else {
			console.log('Connected successfully to server');
		}

		const db = client.db(dbName);

		requireFu(`${__dirname}/commands`)(bot, config, db);
		requireFu(`${__dirname}/schedule`)(Scheduler, bot, config, db);
		requireFu(`${__dirname}/polls`)(bot, config, db);
		requireFu(`${__dirname}/triggers`)(bot, config, db);
		requireFu(`${__dirname}/tops`)(bot, config, db);
		requireFu(`${__dirname}/games`)(bot, config, db, Scheduler);
		requireFu(`${__dirname}/tests`)(bot, config, db);
		requireFu(`${__dirname}/teams`)(Scheduler, bot, config, db);

		process.on('SIGINT', async () => {
			await client.close(false);
			process.exit();
		});
	}
);
