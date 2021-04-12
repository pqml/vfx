import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';

export default class CanvasPreview extends BaseComponent {
	template() {
		return <div class="canvas-preview">
		</div>;
	}

	afterMount() {
		this.storeSubscribe(Store.frame, this.onFrameChange);
	}

	onFrameChange(frame) {
		if (this.img && this.img.parentNode) {
			this.img.parentNode.removeChild(this.img);
		}

		if (!frame || !frame.reference) return;
		this.img = frame.reference;
		this.base.appendChild(this.img);
	}
}
