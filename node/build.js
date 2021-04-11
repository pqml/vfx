const { build } = require('vite');
const runScript = require('./runScript');
const createViteConfig = require('./vite');

runScript(async () => {
	const config = await createViteConfig();
	await build(config);
});
