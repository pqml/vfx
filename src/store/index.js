import { computed, s, w } from '~/utils/state/index';

const Store = {
	tick: s(),

	triggerResize: s(),
	screenPixelRatio: w(1),
	viewportSize: w([ 10, 10 ]),
	viewportRatio: w(1),
	canvasSize: null,

	initialized: w(false),

	sourceName: w(null),
	sourceWidth: w(10),
	sourceHeight: w(10),
	sourceRatio: null,

	rerender: w(false),
	frameDuration: w(30),
	frameIndex: w(0),
	framesCount: null,
	frames: w([]),
	frame: null,


	previewData: w(null),

	keyPressed: w({}),
	pointerDown: w(false),
	panning: false,
	grabbing: false,
	zoomOffset: w(0),
	panOffset: w([ 0, 0 ]),

	wireframeMode: w(true),
	nightMode: w(!!localStorage.getItem('nightmode')),
	helpVisible: w(false)
};

Store.nightMode.subscribe(v => {
	localStorage.setItem('nightmode', v ? 1 : 0);
});

Store.framesCount = computed(
	Store.frames,
	frames => frames ? frames.length : 0
);

Store.sourceRatio = computed(
	[ Store.sourceWidth, Store.sourceHeight ],
	(w, h) => w / h
);

Store.frame = computed(
	[ Store.frameIndex, Store.frames ],
	(index, frames) => frames[ index ] || null
);

Store.canvasSize = computed(
	[ Store.viewportSize, Store.sourceRatio ],
	(size, ratio) => {
		const w = size[ 0 ];
		const h = size[ 1 ];
		const r = w / h;

		const scale = 0.9;

		const cw = (r > ratio ? h * ratio : w) * scale;
		const ch = (r > ratio ? h : w * (1 / ratio)) * scale;
		return [ Math.round(cw), Math.round(ch) ];
	}
);

Store.panning = computed(
	Store.keyPressed,
	key => !!key.SPACE
);

Store.grabbing = computed(
	[ Store.panning, Store.pointerDown ],
	(panning, pointerDown) => panning && pointerDown
);

window.store = Store;

export default Store;
