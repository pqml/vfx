import debounce from 'lodash.debounce';
import Store from '~/store';

const debounceOpts = { trailing: true, leading: true };
const root = document.documentElement;
let ruller;

function init() {
	createRuller();

	setInterval(checkPixelRatio, 5000);
	window.addEventListener('resize', debounce(update, 10, debounceOpts), false);
	update(true);
	checkPixelRatio();

	setTimeout(update, 10);
	setTimeout(update, 150);
	setTimeout(() => update(true), 500);
	Store.triggerResize.subscribe(update);
}

function update(force = false) {
	document.body.appendChild(ruller);
	const rullerBounds = ruller.getBoundingClientRect();
	document.body.removeChild(ruller);
	const width = window.innerWidth;
	const height = rullerBounds.height;
	const size = Store.viewportSize.current;
	if (!force && width === size[ 0 ] && height === size[ 1 ]) return;
	size[ 0 ] = width;
	size[ 1 ] = height;
	Store.viewportRatio.set(width / height, true);
	Store.viewportSize.set(size, true);
	root.style.setProperty('--inner-height', window.innerHeight + 'px');
}

function checkPixelRatio() {
	if (Store.screenPixelRatio.current === window.devicePixelRatio) return;
	Store.screenPixelRatio.set(window.devicePixelRatio || 1);
}

function createRuller() {
	ruller = document.createElement('div');
	ruller.className = 'ruller';
	Object.assign(ruller.style, {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '1px',
		height: '100vh',
		pointerEvents: 'none',
		userSelect: 'none',
		zIndex: -1,
		opacity: 0
	});
	document.body.appendChild(ruller);
}

export default {
	init,
	update
};
