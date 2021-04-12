import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import CanvasPreview from './CanvasPreview';
import CanvasRenderer from './CanvasRenderer';

import './EditorCanvas.scss';

export default class EditorCanvas extends BaseComponent {
	template() {
		return <section class="editor-canvas">
			<div
				class="canvas-wrapper"
				ref={this.ref('wrapper')}
			>
				<CanvasPreview />
				<CanvasRenderer ref={this.ref('renderer')} />
			</div>
		</section>;
	}

	afterRender() {
		this.storeSubscribe(Store.canvasSize, this.onResize);
		this.storeSubscribe(Store.zoomOffset, this.move);
		this.storeSubscribe(Store.panOffset, this.move);
	}

	onResize(size) {
		this.refs.wrapper.style.width = size[ 0 ] + 'px';
		this.refs.wrapper.style.height = size[ 1 ] + 'px';
	}

	move() {
		const scale = Math.pow(2, Store.zoomOffset.current);
		const pan = Store.panOffset.current;
		const x = pan[ 0 ];
		const y = pan[ 1 ];

		this.refs.wrapper.style.transform = [
			'scale(' + scale + ')',
			'translate(' + x + 'px, ' + y + 'px)'
		].join(' ');
	}
}
