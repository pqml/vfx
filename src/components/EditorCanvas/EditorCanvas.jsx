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
				<CanvasRenderer />
			</div>
		</section>;
	}

	afterRender() {
		this.storeSubscribe(Store.canvasSize, this.onResize);
	}

	onResize(size) {
		this.refs.wrapper.style.width = size[ 0 ] + 'px';
		this.refs.wrapper.style.height = size[ 1 ] + 'px';
	}
}
