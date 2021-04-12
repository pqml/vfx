import { h, render } from '~/utils/jsx';
import Store from '~/store';
import App from '~/components/App/App';
import { Viewport } from '~/controllers';
import raf from './utils/raf';

let instance;
init();

function init() {
	Viewport.init();

	raf.add((dt) => {
		Store.tick.dispatch(dt);
	});

	reload(App);
	Store.initialized.set(true);

	if (import.meta.hot) {
		import.meta.hot.accept('./components/App/App', reload);
	}
}

function reload(C) {
	if (instance) instance.destroy();
	console.clear();
	instance = render(h(C.default || C), document.body).components[ 0 ];
}
