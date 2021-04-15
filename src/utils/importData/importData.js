import { decode } from '~/vfx/decode';
import Frame from '~/components/Frame/Frame';
import { holdStoreDispatches, releaseStoreDispatches } from '~/utils/state';
import Store from '~/store';

function getFrames(data) {
	if (!data.frames) throw new Error('Bad data');
	const newFrames = [];

	data.frames.forEach((f, index) => {
		const currentFrames = Store.frames.current;
		const currentFrame = currentFrames[ index ];

		const frame = new Frame({
			reference: currentFrame && currentFrame.reference
		});

		newFrames.push(frame);

		f.shapes && f.shapes.forEach(points => {
			frame.addShape();
			points.forEach(point => {
				const x = point[ 0 ] / data.width;
				const y = point[ 1 ] / data.height;
				frame.addPoint(x, y, true);
			});
		});
	});

	return newFrames;
}

export default function importData(file) {
	return new Promise(resolve => {
		if (!file) return resolve(null);

		let name = file.name.split('.');
		const ext = name.pop();
		name = name.join('.');

		const reader = new FileReader();

		reader.onload = () => {
			let data;
			try {
				if (ext === 'json') data = JSON.parse(reader.result);
				else if (ext === 'vfx64') data = decode(reader.result);
				else if (ext === 'vfx') data = decode(reader.result);
				const width = data.width || 10;
				const height = data.height || 10;
				const frameDuration = data.frameDuration || 30;
				const frames = getFrames(data);
				return resolve({ name, width, height, frameDuration, frames });
			} catch (err) {
				console.error(err);
				return resolve(null);
			}
		};

		if (ext === 'json' || ext === 'vfx64') reader.readAsText(file);
		else if (ext === 'vfx') reader.readAsArrayBuffer(file);
		else resolve(null);
	});
}

