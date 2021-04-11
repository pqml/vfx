const { createServer } = require('vite');
const runScript = require('./runScript');
const createViteConfig = require('./vite');

runScript(async () => {
	const config = await createViteConfig();
	const server = await createServer(config);
	server.listen();
});
