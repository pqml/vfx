import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import EditorShortcuts from '../EditorShortcuts/EditorShortcuts';
import EditorInfos from '../EditorInfos/EditorInfos';

import './Editor.scss';
import Store from '~/store/index';
import EditorCanvas from '../EditorCanvas/EditorCanvas';
import EditorPreview from '../EditorPreview/EditorPreview';

const TurboMode = [
	'ARROWRIGHT',
	'ARROWLEFT',
	'BACKSPACE',
	'Z'
];

const Commands = {
	'ENTER': 'previewSfx',
	'H': 'toggleHelp',
	'S': 'exportSfx',
	'W': 'toggleWireframe',
	'N': 'toggleNightMode',
	'Z': 'removePoint',
	'ARROWRIGHT': 'nextFrame',
	'ARROWLEFT': 'previousFrame',
	'BACKSPACE': 'removePoint',
	'SHIFT': 'shiftPressed'
};

const fakeLink = document.createElement('a');
Object.assign(fakeLink.style, {
	position: 'fixed',
	width: '1px',
	height: '1px',
	top: 0,
	left: 0,
	opacity: 0.5,
	overflow: 'hidden'
});

export default class Editor extends BaseComponent {
	template() {
		return <section class="editor">
			<EditorInfos />
			<EditorShortcuts />
			<EditorCanvas />
			<EditorPreview />
		</section>;
	}

	afterRender() {
		this.keysDown = {};
		window.addEventListener('keydown', this.bind('onKeyDown', 1));
		window.addEventListener('keyup', this.bind('onKeyUp', 1));
	}

	beforeDestroy() {
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
	}

	onKeyDown(e) {
		const key = e.key.toUpperCase();
		if (!Commands[ key ] || this.keysDown[ key ]) return;
		if (!TurboMode.includes(key)) this.keysDown[ key ] = true;
		this[ Commands[ key ] ]();
	}

	onKeyUp(e) {
		const key = e.key.toUpperCase();
		if (!Commands[ key ]) return;
		this.keysDown[ key ] = false;
		if (key === 'SHIFT') Store.shiftPressed.set(false);
	}

	shiftPressed() {
		Store.shiftPressed.set(true);
	}

	previewSfx() {
		const data = this.getData();
		Store.previewData.set(Store.previewData.current ? null : data);
	}

	toggleHelp() {
		Store.helpVisible.set(!Store.helpVisible.current);
	}

	exportSfx() {
		const data = this.getData();
		const header = 'data:text/json;charset=utf-8,';
		const dataStr = header + encodeURIComponent(JSON.stringify(data));
		const name = Store.sourceName.current;

		document.body.appendChild(fakeLink);
		fakeLink.setAttribute('href', dataStr);
		fakeLink.setAttribute('download', name + '.json');
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
