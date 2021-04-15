import { decode } from './decode';

const freePool = [];
const activePool = new Set();

let dt = 16.67;
let lastTime = performance.now();
let initialized = false;
let renderingID = -1;
let rendering = false;

const renderVfx = vfx => vfx.render(dt);

const DEFAULT_DATA = { width: 1, height: 1, frameDuration: 33, frames: [] };
let MAX_POOL = 20;
let INITIAL_POOL = 20;
const DEBUG = false;

function init({ maxPool = 20, initialPool = 20 } = {}) {
	if (initialized) return;
	MAX_POOL = maxPool;
	INITIAL_POOL = initialPool;
	initialized = true;
	for (let i = 0; i < INITIAL_POOL; i++) freePool.push(new Vfx());
}

function startRender() {
	if (rendering) return;
	rendering = true;
	renderingID = requestAnimationFrame(render);
}

function stopRender() {
	if (!rendering) return;
	rendering = false;
	cancelAnimationFrame(renderingID);
}

function render() {
	renderingID = requestAnimationFrame(render);
	const now = performance.now();
	dt = now - lastTime;
	lastTime = now;
	activePool.forEach(renderVfx);
}

function create(opts = {}) {
	if (!initialized) init();
	startRender();
	const vfx = freePool.pop() || new Vfx();
	activePool.add(vfx);
	vfx.reset(opts);
	return vfx;
}

class Vfx {
	constructor() {
		this.frameDuration = 33;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = this.canvas.height = 0;
		this.canvas.style.pointerEvents = 'none';
		this.canvas.style.display = 'block';
	}

	reset(opts = {}) {
		this.destroyed = false;

		this.data = opts.data || DEFAULT_DATA;
		this.naturalWidth = this.data.width || 1;
		this.naturalHeight = this.data.height || 1;

		this.frames = this.data.frames || [];
		this.framecount = this.frames.length | 0;
		this.frameDuration =
			opts.frameDuration ||
			this.data.frameDuration ||
			DEFAULT_DATA.frameDuration;

		this.onComplete = opts.onComplete;
		this.delay = opts.delay | 0;
		this.loop = !!opts.loop;
		this.dpi = opts.dpi || Math.min(opts.maxDpi || 2, window.devicePixelRatio);

		this.width = Math.round(
			(opts.width || opts.size || this.naturalWidth) * this.dpi
		);

		this.height = Math.round(
			opts.height
				? opts.height * this.dpi
				: this.width * (this.naturalHeight / this.naturalWidth)
		);

		const s = this.canvas.style;
		this.widthRatio = this.width / this.naturalWidth;
		this.heightRatio = this.height / this.naturalHeight;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		s.width = Math.round(this.width / this.dpi) + 'px';
		s.height = Math.round(this.height / this.dpi) + 'px';

		this.ctx.fillStyle = opts.color ? opts.color : '#ffffff';
		this.ctx.strokeStyle = opts.color ? opts.color : '#ffffff';

		if (opts.parent) {
			s.position = '';
			s.zIndex = '';
			opts.parent.appendChild(this.canvas);
		} else {
			s.position = 'fixed';
			s.zIndex = opts.z || 99999;
			document.body.appendChild(this.canvas);
		}

		this.x = opts.x || 0;
		this.y = opts.y || 0;
		this.ang = opts.ang || 0;
		s.transform = `translate(${ this.x }px, ${ this.y }px) rotate(${ this.ang }deg)`;

		// Directly render first frame ?
		this.currentFrame = -1;
		this.accum = this.frameDuration;
	}

	render(dt) {
		if (this.destroyed) return;
		if (this.delay > 0 && (this.delay -= dt) > 0) return;

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
		this.canvas.width = this.canvas.height = 0;
		activePool.delete(this);

		if (this.canvas.parentNode) {
			this.canvas.parentNode.removeChild(this.canvas);
		}

		const completeCallback = this.onComplete;
		this.onComplete = null;

		if (freePool.length < MAX_POOL) freePool.push(this);
		if (DEBUG) console.log('Release Vfx - pool length: ', freePool.length);

		if (completeCallback) completeCallback();

		if (activePool.size < 1) {
			stopRender();
			if (DEBUG) console.log('Stop renderer');
		}
	}
}


export default {
	init,
	create,
	play: create,
	decode
};
