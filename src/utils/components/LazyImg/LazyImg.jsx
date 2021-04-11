import BaseComponent from '../BaseComponent/BaseComponent';

import './LazyImg.scss';

export default class LazyImg extends BaseComponent {
	constructor(_props) {
		super(_props);
		this.bind('onLoad');

		this.loaded = new Promise(resolve => this.resolveLoading = resolve);

		const props = Object.assign({}, _props);
		const color = props.color;
		const ratio = props.ratio || 1;
		const height = ratio ? ((1 / ratio) * 100).toFixed(2) + '%' : null;
		const src = props.src;
		const alt = props.alt || '';
		const ref = props.ref;

		let classes = [ 'image image--lazy', (props.class || '') ];
		if (props.fullHeight) classes.push('full-height');
		if (props.contain) classes.push('contain');
		classes = classes.join(' ').trim();

		delete props.ref;
		delete props.contain;
		delete props.fullHeight;
		delete props.color;
		delete props.ratio;
		delete props.class;
		delete props.className;
		delete props.src;
		delete props.alt;

		Object.assign(this.props, {
			subProps: props,
			ref,
			color,
			classes,
			height,
			src,
			alt,
		});
	}

	template({ classes, alt, subProps }) {
		return <figure
			class={classes}
			{...subProps}>
			<img
				alt={alt}
				draggable={false}
				decoding="async"
				ref={this.ref('img')} />
		</figure>;
	}

	onLoad() {
		this.resolveLoading();
		this.base.classList.add('loaded');
		this.refs.img.removeEventListener('load', this.onLoad);
	}


	afterRender({ color, height, src }) {
		const base = this.base;
		const img = this.refs.img;
		if (color) base.style.setProperty('--image-bg-color', color);
		if (height) base.style.setProperty('--image-height', height);
		img.addEventListener('load', this.onLoad);
		img.decoding = 'async';
		img.src = src;
	}

	beforeDestroy() {
		this.refs.img.removeEventListener('load', this.onLoad);
	}
}
