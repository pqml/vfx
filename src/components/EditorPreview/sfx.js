const freePool = [];
const activePool = new Set();

let dt = 16.67;
let lastTime = performance.now();
let initialized = false;
const renderSfx = sfx => sfx.render(dt);

const INITIAL_POOL = 10;
const DEBUG = true;

function init() {
	if (initialized) return;
	initialized = true;
	for (let i = 0; i < INITIAL_POOL; i++) {
		freePool.push(new Sfx());
	}

	render();
}

function render() {
	const now = performance.now();
	dt = now - lastTime;
	lastTime = now;
	requestAnimationFrame(render);
	activePool.forEach(renderSfx);
}

function create(opts = {}) {
	init();
	const sfx = freePool.pop() || new Sfx();
	activePool.add(sfx);
	sfx.reset(opts);
	return sfx;
}

class Sfx {
	constructor() {
		this.frameDuration = 33;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
	}

	reset(opts = {}) {
		this.data = opts.data;
		this.frames = opts.data ? opts.data.frames : [];
		this.framecount = this.frames.length | 0;
		this.loop = !!opts.loop;
		this.accum = 0;
		this.destroyed = false;

		this.naturalWidth = this.data ? this.data.width : 10;
		this.naturalHeight = this.data ? this.data.height : 10;

		this.dpi = window.devicePixelRatio;
		const heightRatio = (this.naturalHeight / this.naturalWidth);
		const size = (opts.size || this.naturalWidth) * this.dpi;
		this.canvas.width = this.width = Math.round(size);
		this.canvas.height = this.height = Math.round(size * heightRatio);
		this.canvas.style.width = Math.round(this.width / this.dpi) + 'px';
		this.canvas.style.height = Math.round(this.height / this.dpi) + 'px';

		this.widthRatio = this.width / this.naturalWidth;
		this.heightRatio = this.height / this.naturalHeight;

		this.ctx.fillStyle = opts.color ? opts.color : '#ffffff';
		this.ctx.strokeStyle = opts.color ? opts.color : '#ffffff';

		if (opts.parent) {
			this.canvas.style.position = 'relative';
			this.canvas.style.top = '';
			this.canvas.style.left = '';
			this.canvas.style.zIndex = '';
			opts.parent.appendChild(this.canvas);
		} else {
			this.canvas.style.position = 'fixed';
			this.canvas.style.top = ((opts.y || 0) - (this.height / this.dpi / 2)) + 'px';
			this.canvas.style.left = ((opts.x || 0) - (this.width / this.dpi / 2)) + 'px';
			this.canvas.style.zIndex = opts.z || 99999;
			document.body.appendChild(this.canvas);
		}

		this.currentFrame = -1;
		this.render(this.frameDuration);
	}

	render(dt) {
		if (this.destroyed) return;

		this.accum += dt;
		if (this.accum < this.frameDuration) return;
		this.accum = this.accum % this.frameDuration;
		this.currentFrame++;

		if (this.currentFrame >= this.framecount) {
			if (this.loop) this.currentFrame = 0;
			else return this.destroy();
		}

		const ctx = this.ctx;
		const frame = this.frames[ this.currentFrame ];
		ctx.clearRect(0, 0, this.width, this.height);
		if (!frame) return;
		for (let i = 0, l = frame.shapes.length; i < l; i++) {
			const points = frame.shapes[ i ];
			if (points.length > 2) {
				ctx.beginPath();
				for (let j = 0; j < points.length; j++) {
					const pt = points[ j ];
					const x = pt[ 0 ] * this.widthRatio;
					const y = pt[ 1 ] * this.heightRatio;
					if (j === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.fill();
			}
		}
	}

	destroy() {
		if (this.destroyed) return;
		this.destroyed = true;
		this.data = null;
		activePool.delete(this);
		freePool.push(this);
		if (this.canvas.parentNode) {
			this.canvas.parentNode.removeChild(this.canvas);
		}
		if (DEBUG) {
			console.log('Release Sfx - pool length: ', freePool.length);
		}
	}
}


export default {
	init,
	create
};
