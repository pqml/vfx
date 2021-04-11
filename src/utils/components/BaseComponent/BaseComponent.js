import { Component } from '../../jsx';
import { bind } from '../../bind';
import csstween from '../../csstween';

export default class BaseComponent extends Component {
	constructor(props) {
		super(props);
		this.tweens = {};
		this.tweenId = 0;
	}

	bind(method, argCount = 0) {
		this[ method ] = bind(method, this, argCount);
		return this[ method ];
	}

	csstween(props) {
		return this.tweens[ ++this.tweenId ] = csstween(props);
	}

	killAllCssTweens() {
		// destroy css tweens
		for (const k in this.tweens) {
			const tween = this.tweens[ k ];
			if (!tween || !tween.destroy) continue;
			tween.destroy();
		}

		this.tweens = {};
	}

	destroy() {
		this.showPromise = null;
		this.hidePromise = null;

		this.killAllCssTweens();

		super.destroy();
	}
}
