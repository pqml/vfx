const { red, gray } = require('kleur');

module.exports = async function runScript(fn) {
	try {
		await fn();
	} catch (err) {
		if (err && err.stack) {
			err.stack
				.split('\n')
				.forEach(
					(l, i) => console.error(i > 0 ? gray(l) : red(l))
				);
			console.error();
		} else {
			console.error(err);
		}

		process.exit(1);
	}
};
