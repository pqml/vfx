const paths = require('./paths');

module.exports = function createViteConfig() {
	return {
		root: paths.src,
		clearScreen: false,
		publicDir: paths.static,
		resolve: {
			alias: {
				'~/': paths.src + '/',
				'~~/': paths.root + '/'
			}
		},
		server: {},
		build: {
			outDir: paths.dist,
			emptyOutDir: true,
			target: 'esnext'
		}
	};
};
