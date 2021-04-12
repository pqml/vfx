import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';

const TWO_PI = Math.PI * 2;

export default class CanvasRenderer extends BaseComponent {
	template() {
		return <div class="canvas-renderer">
			<canvas
				ref={this.ref('canvas')}
				onClick={this.bind('onClick', 1)}
			/>
		</div>;
	}

	afterMount() {
		this.needsUpdate = true;
		this.canvas = this.refs.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.storeSubscribe(Store.canvasSize, this.resize);
		this.storeSubscribe(Store.screenPixelRatio, this.resize);
		this.storeSubscribe(Store.frame, () => this.needsUpdate = true);
		this.storeSubscribe(Store.frames, () => this.needsUpdate = true);
		this.storeSubscribe(Store.nightMode, () => this.needsUpdate = true);
		this.storeSubscribe(Store.wireframeMode, () => this.needsUpdate = true);
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

	onClick(e) {
		const size = Store.canvasSize.current;
		const x = e.layerX;
		const y = e.layerY;
		const nx = x / size[ 0 ];
		const ny = y / size[ 1 ];

		const frame = Store.frame.current;
		if (!frame) return;

		frame.addPoint(nx, ny);
	}

	render(dt) {
		if (!this.needsUpdate) return;
		this.needsUpdate = false;
		const frame = Store.frame.current;
		const ctx = this.ctx;
		const width = this.canvas.width;
		const height = this.canvas.height;
		const dpi = Store.screenPixelRatio.current;

		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = Store.nightMode.current ? '#ffffff' : '#000000';
		ctx.strokeStyle = Store.nightMode.current ? '#ffffff' : '#000000';
		ctx.lineWidth = dpi;

		if (!frame) return;
		for (let i = 0, l = frame.shapes.length; i < l; i++) {
			const lastShape = i + 1 === l;
			const points = frame.shapes[ i ];
			if (points.length === 0) {
				continue;
			} else if (points.length > 1) {
				ctx.beginPath();
				for (let j = 0; j < points.length; j++) {
					const pt = points[ j ];
					const x = pt[ 0 ] * width;
					const y = pt[ 1 ] * height;
					if (j === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				const useWireframe = Store.wireframeMode.current || points.length < 3;
				if (!useWireframe || !lastShape) ctx.closePath();
				if (useWireframe) ctx.stroke();
				else ctx.fill();
			} else if (points.length === 1) {
				const x = points[ 0 ][ 0 ] * width;
				const y = points[ 0 ][ 1 ] * height;
				ctx.beginPath();
				ctx.arc(x, y, dpi, 0, TWO_PI);
				ctx.fill();
			}
		}
	}
}
