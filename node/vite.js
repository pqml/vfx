const paths = require('./paths');
const autoprefixer = require('autoprefixer');
const sortMediaQueries = require('postcss-sort-media-queries');

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
		css: {
			postcss: {
				plugins: [
					autoprefixer({ grid: true }),
					sortMediaQueries({ sort: 'mobile-first' })
				]
			},
			preprocessorOptions: {
				scss: {
					additionalData: `
						@import "~/style/__imports";
					`,
					sassOptions: {
						outputStyle: 'compressed'
					}
				}
			}
		},
		esbuild: {
			jsxFactory: 'h',
			jsxFragment: 'h.f',
			jsxInject: `import { h } from '~/utils/jsx'`
		},
		server: {},
		build: {
			outDir: paths.dist,
			emptyOutDir: true,
			target: 'esnext'
		}
	};
};
