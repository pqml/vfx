import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';

const TWO_PI = Math.PI * 2;
const temp = { x: 0, y: 0 };

const WHITE = '#ffffff';
const BLACK = '#000000';
const WHITE_SEMI = 'rgba(255, 255, 255, 0.3)';
const BLACK_SEMI = 'rgba(0, 0, 0, 0.3)';

export default class CanvasRenderer extends BaseComponent {
	template() {
		return <div class="canvas-renderer">
			<canvas
				ref={this.ref('canvas')}
			/>
		</div>;
	}

	afterMount() {
		this.mousePos = { x: 0, y: 0 };
		this.needsUpdate = true;
		this.canvas = this.refs.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.storeSubscribe(Store.canvasSize, this.resize);
		this.storeSubscribe(Store.screenPixelRatio, this.resize);
		this.storeSubscribe(Store.frame, () => this.needsUpdate = true);
		this.storeSubscribe(Store.frames, () => this.needsUpdate = true);
		this.storeSubscribe(Store.nightMode, () => this.needsUpdate = true);
		this.storeSubscribe(Store.wireframeMode, () => this.needsUpdate = true);
		this.storeSubscribe(Store.keyPressed, () => this.needsUpdate = true);
		this.storeSubscribe(Store.tick, this.render);
	}

	beforeDestroy() {
		this.canvas = this.ctx = null;
	}

	resize() {
		const size = Store.canvasSize.current;
		const dpi = Store.screenPixelRatio.current;
		this.canvas.width = size[ 0 ] * dpi;
		this.canvas.height = size[ 1 ] * dpi;
		this.canvas.style.width = size[ 0 ] + 'px';
		this.canvas.style.height = size[ 1 ] + 'px';
		this.needsUpdate = true;
	}

	getPosition(e, vec = temp) {
		const bounds = this.refs.canvas.getBoundingClientRect();
		const x = e.clientX - bounds.x;
		const y = e.clientY - bounds.y;
		vec.x = x / bounds.width;
		vec.y = y / bounds.height;
		return vec;
	}

	onMouseMove(e) {
		this.getPosition(e, this.mousePos);
		this.needsUpdate = true;
	}

	onClick(e) {
		const pos = this.getPosition(e);
		const x = pos.x;
		const y = pos.y;

		const frame = Store.frame.current;
		if (!frame) return;

		frame.addPoint(x, y);
	}

	render(dt) {
		if (!this.needsUpdate) return;
		this.needsUpdate = false;

		const shiftPressed = !!Store.keyPressed.current.SHIFT;
		const spacePressed = !!Store.keyPressed.current.SPACE;

		const frame = Store.frame.current;
		const ctx = this.ctx;
		const width = this.canvas.width;
		const height = this.canvas.height;
		const dpi = Store.screenPixelRatio.current;

		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = Store.nightMode.current ? WHITE : BLACK;
		ctx.strokeStyle = Store.nightMode.current ? WHITE : BLACK;
		ctx.lineWidth = dpi;

		if (!frame) return;

		let hasPoint = false;
		let lastX = 0;
		let lastY = 0;

		for (let i = 0, l = frame.shapes.length; i < l; i++) {
			const lastShape = i + 1 === l && !shiftPressed;
			const points = frame.shapes[ i ];
			hasPoint = false;

			if (points.length === 0) {
				continue;
			} else if (points.length > 1) {
				ctx.beginPath();
				for (let j = 0; j < points.length; j++) {
					const pt = points[ j ];
					const x = Math.round(pt[ 0 ] * width);
					const y = Math.round(pt[ 1 ] * height);
					if (j === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
					hasPoint = true;
					lastX = x;
					lastY = y;
				}
				const useWireframe = Store.wireframeMode.current || points.length < 3;
				if (!useWireframe || !lastShape) ctx.closePath();
				if (useWireframe) ctx.stroke();
				else ctx.fill();
			} else if (points.length === 1) {
				const x = Math.round(points[ 0 ][ 0 ] * width);
				const y = Math.round(points[ 0 ][ 1 ] * height);
				ctx.beginPath();
				ctx.arc(x, y, dpi / 2, 0, TWO_PI);
				ctx.fill();
				hasPoint = true;
				lastX = x;
				lastY = y;
			}
		}

		const points = frame ? frame.shapePointCount : 0;

		if (hasPoint && !spacePressed && (points < 3 || !shiftPressed)) {
			ctx.strokeStyle = Store.nightMode.current ? WHITE_SEMI : BLACK_SEMI;
			ctx.beginPath();
			ctx.moveTo(lastX, lastY);
			ctx.lineTo(
				Math.round(this.mousePos.x * width),
				Math.round(this.mousePos.y * height)
			);
			ctx.stroke();
		} else if (!hasPoint || shiftPressed) {
			ctx.beginPath();
			ctx.arc(
				Math.round(this.mousePos.x * width),
				Math.round(this.mousePos.y * height),
				dpi / 2, 0, TWO_PI
			);
			ctx.fill();
		}
	}
}
