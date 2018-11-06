module.exports = function formatString(format) {
	const args = Array.prototype.slice.call(arguments, 1);
	return format.replace(/{(\d+)}/g, (match, number) => (typeof args[number] !== 'undefined' ?
		args[number] :
		match));
};