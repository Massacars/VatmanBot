const BOT_JR_USERNAME = 'StartupWars01Bot';
const BOT_USERNAME = 'StartupWarsBot';
const FORWARD_TIME = 43200;

const checkFwd = async msg => {
	return (msg.forward_from.username === BOT_JR_USERNAME || msg.forward_from.username === BOT_USERNAME) ? true : false;
};

const checkTime = async msg => {
	const currentTime = Math.floor(Date.now() / 1000);
	return (currentTime - msg.forward_date < FORWARD_TIME) ? true : false;
};

const getUserObjTemplate = async (msg) => {
	const userObjTemplate = {
		_id: msg.from.id,
		name: msg.from.first_name,
		lastName: msg.from.last_name,
		username: '@' + msg.from.username,
		admin: false,
		division: msg.chat.id,
		state: {
			active: true,
			sendMsg: false,
			sendLvl: false,
			sendMsgChat: ''
		},
		tops: {
			lastforward: 0
		}
	};
	return userObjTemplate;
};

const checkLastForward = async (userObj, msg) => {
	return (userObj.tops.lastforward == msg.forward_date) ? true : false;
};

module.exports = {
	checkFwd,
	checkTime,
	getUserObjTemplate,
	checkLastForward
};