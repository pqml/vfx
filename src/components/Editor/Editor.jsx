import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import EditorShortcuts from '../EditorShortcuts/EditorShortcuts';
import EditorInfos from '../EditorInfos/EditorInfos';

import './Editor.scss';
import Store from '~/store/index';
import EditorCanvas from '../EditorCanvas/EditorCanvas';
import EditorPreview from '../EditorPreview/EditorPreview';
import { encode } from '~/vfx/encode';

const TurboMode = [
	'ARROWRIGHT',
	'ARROWLEFT',
	'BACKSPACE',
	'Z'
];

const Commands = {
	'ENTER': 'previewVfx',
	'H': 'toggleHelp',
	'S': 'exportVfx',
	'B': 'exportVfx64',
	'W': 'toggleWireframe',
	'N': 'toggleNightMode',
	'Z': 'removePoint',
	'ARROWRIGHT': 'nextFrame',
	'ARROWLEFT': 'previousFrame',
	'BACKSPACE': 'removePoint',
	'SPACE': 'resetWorkspace',
	'SHIFT': 'noop',
	'ALT': 'noop'
};

const hiddenStyle = {
	position: 'fixed',
	width: '1px',
	height: '1px',
	top: 0,
	left: 0,
	opacity: 0.5,
	overflow: 'hidden'
};

const fakeLink = document.createElement('a');
Object.assign(fakeLink.style, hiddenStyle);

export default class Editor extends BaseComponent {
	noop() {}

	template() {
		return <section class="editor">
			<EditorInfos />
			<EditorShortcuts />
			<EditorCanvas />
			<EditorPreview />
		</section>;
	}

	afterRender() {
		this.pointerX = 0;
		this.pointerY = 0;
		this.keysDown = {};
		this.bind('onImportVfx', 1);
		window.addEventListener('keydown', this.bind('onKeyDown', 1));
		window.addEventListener('keyup', this.bind('onKeyUp', 1));
		window.addEventListener('mousewheel', this.bind('onWheel', 1));
		window.addEventListener('pointerdown', this.bind('onPointerDown', 1));
		window.addEventListener('pointerup', this.bind('onPointerUp', 1));
		window.addEventListener('pointerup', this.bind('onPointerUp', 1));
		window.addEventListener('pointermove', this.bind('onPointerMove', 1));
	}

	beforeDestroy() {
		window.removeEventListener('mousewheel', this.onWheel);
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
		window.removeEventListener('pointerdown', this.onPointerDown);
		window.removeEventListener('pointerup', this.onPointerUp);
		window.removeEventListener('pointerup', this.onPointerUp);
		window.removeEventListener('pointermove', this.onPointerMove);
	}

	onPointerDown(e) {
		this.pointerX = e.screenX;
		this.pointerY = e.screenY;
		Store.pointerDown.set(true);
	}

	onPointerUp() {
		Store.pointerDown.set(false);
	}

	onPointerMove(e) {
		if (!Store.grabbing.current) return;
		const pan = Store.panOffset.current;
		const scale = Math.pow(2, Store.zoomOffset.current);
		pan[ 0 ] += (e.screenX - this.pointerX) / scale;
		pan[ 1 ] += (e.screenY - this.pointerY) / scale;
		this.pointerX = e.screenX;
		this.pointerY = e.screenY;
		Store.panOffset.set(pan, true);
	}

	onWheel(e) {
		if (!Store.keyPressed.current.SPACE) return;
		const delta = -e.deltaY / 300;
		Store.zoomOffset.set(Store.zoomOffset.current + delta);
	}

	resetWorkspace() {
		if (!Store.keyPressed.current.SHIFT) return;
		Store.zoomOffset.set(0);
		const pan = Store.panOffset.current;
		pan[ 0 ] = 0;
		pan[ 1 ] = 0;
		Store.panOffset.set(pan, true);
	}

	onKeyDown(e) {
		const tag = e.target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA') return;
		const key = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
		if (!Commands[ key ] || this.keysDown[ key ]) return;
		if (!TurboMode.includes(key)) this.keysDown[ key ] = true;
		Store.keyPressed.set(this.keysDown, true);
		this[ Commands[ key ] ]();
	}

	onKeyUp(e) {
		const tag = e.target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA') return;
		const key = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
		if (!Commands[ key ]) return;
		this.keysDown[ key ] = false;
		Store.keyPressed.set(this.keysDown, true);
	}

	previewVfx() {
		const base64 = encode(this.getData(), { base64: true });
		Store.previewData.set(Store.previewData.current ? null : base64);
	}

	toggleHelp() {
		Store.helpVisible.set(!Store.helpVisible.current);
	}

	exportVfx() {
		const blob = encode(this.getData());
		const url = URL.createObjectURL(blob);
		const name = Store.sourceName.current;
		document.body.appendChild(fakeLink);
		fakeLink.setAttribute('href', url);
		fakeLink.setAttribute('download', name + '.vfx');
		fakeLink.click();
		document.body.removeChild(fakeLink);
	}

	exportVfx64() {
		const data = encode(this.getData(), { base64: true });
		const name = Store.sourceName.current;
		const header = 'data:text/plain;charset=utf-8,';
		const url = header + encodeURIComponent(data);
		document.body.appendChild(fakeLink);
		fakeLink.setAttribute('href', url);
		fakeLink.setAttribute('download', name + '.vfx64');
		fakeLink.click();
		document.body.removeChild(fakeLink);
	}

	toggleNightMode() {
		Store.nightMode.set(!Store.nightMode.current);
	}

	previousFrame() {
		if (Store.frameIndex.current <= 0) return;
		Store.frameIndex.set(Store.frameIndex.current - 1);
	}

	nextFrame() {
		const lastIndex = (Store.frames.current.length - 1);
		if (Store.frameIndex.current >= lastIndex) return;
		Store.frameIndex.set(Store.frameIndex.current + 1);
	}

	removePoint() {
		const frame = Store.frame.current;
		if (!frame) return;
		frame.removePoint();
	}

	getData() {
		const width = Store.sourceWidth.current;
		const height = Store.sourceHeight.current;
		const data = {
			width,
			height,
			frameDuration: Store.frameDuration.current,
			frames: Store.frames.current.map(frame => {
				const shapes = JSON.parse(JSON.stringify(frame.shapes));
				const count = shapes.length;
				if (count && shapes[ count - 1 ].length < 3) shapes.pop();

				shapes.forEach(points => points.forEach(pt => {
					pt[ 0 ] = Math.round(pt[ 0 ] * width);
					pt[ 1 ] = Math.round(pt[ 1 ] * height);
				}));

				return { shapes };
			})
		};

		return data;
	}

	toggleWireframe() {
		Store.wireframeMode.set(!Store.wireframeMode.current);
	}
}
