const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const requireFu = require('require-fu');

const bot = new TelegramBot(config.token, { polling: true });

requireFu(`${__dirname}/commands`)(bot, config);