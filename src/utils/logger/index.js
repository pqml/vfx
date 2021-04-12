// All-purpose logger

function noop() {}
const noopObj = { log: noop, warn: noop, error: noop };
let logger = () => noopObj;

logger = function logger(prefix, color, background, mute) {
	if (mute) return noopObj;

	const pre = [];
	prefix = prefix.toUpperCase();

	pre.push('%c%s');
	let style = 'font-weight:bold; line-height: 1.2em;';
	if (color) style += `color:${ color };`;
	if (background) style += `background-color:${ background };`;
	style += 'border-radius: 4px;padding: 1px 6px 0;';
	pre.push(style);
	pre.push(prefix);

	return {
		log: console.log.bind(console, ...pre),
		warn: console.warn.bind(console, ...pre),
		error: console.error.bind(console, ...pre)
	};
};

export default logger;
