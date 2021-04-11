const path = require('path');
const root = path.join(__dirname, '..');

module.exports = {
	root: root,
	src: path.join(root, 'src'),
	dist: path.join(root, 'dist'),
	static: path.join(root, 'static'),
	assets: 'assets'
};
