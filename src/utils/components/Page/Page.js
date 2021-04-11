import BaseComponent from '../BaseComponent/BaseComponent';

export default class Page extends BaseComponent {
	load() {

		// this.log( 'load' );

	}

	show(oldPage) {
		if (oldPage) oldPage.hide();
	}

	hide() {
		this.destroy();
	}
}

