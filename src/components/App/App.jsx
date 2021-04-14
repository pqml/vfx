import './App.scss';

import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import Store from '~/store';

import ImportZone from '../ImportZone/ImportZone';
import Editor from '../Editor/Editor';
import Logo from '../Logo/Logo';

const html = document.documentElement;

export default class App extends BaseComponent {
	template() {
		return <main class="app">
			<Logo/>
		</main>;
	}

	afterRender() {
		this.storeSubscribe(Store.sourceName, this.changeCurrentView);

		// Reset frames when source changes
		this.storeSubscribe(Store.framesCount, () => {
			Store.frameIndex.set(0);
		});

		// When night mode is on, toggle class
		this.storeSubscribe(Store.nightMode, nightMode => {
			html.classList.toggle('nightmode', !!nightMode);
		});

		this.storeSubscribe(Store.panning, panning => {
			html.classList.toggle('panning', !!panning);
		});

		this.storeSubscribe(Store.grabbing, grabbing => {
			html.classList.toggle('grabbing', !!grabbing);
		});
	}

	changeCurrentView(hasName) {
		if (this.refs.currentView) this.refs.currentView.destroy();
		const View = hasName && hasName.length ? Editor : ImportZone;
		this.render(<View ref={this.ref('currentView')} />, this.base);
	}
}
