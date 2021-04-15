function createDecoder() {
	const State = {
		StartFrame: 1,
		StartShape: 2,
		AddPoints: 3
	};

	function b64ToBuffer(base64) {
		const binary_string = atob(base64);
		const len = binary_string.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) bytes[ i ] = binary_string.charCodeAt(i);
		return bytes.buffer;
	}

	function decode(buffer) {
		// const begin = performance.now();

		if (typeof buffer === 'string') buffer = b64ToBuffer(buffer);
		const v = new DataView(buffer);

		let state = State.StartFrame;
		let remainingShapes = 0;
		let remainingPoints = 0;
		let currentFrame;
		let currentShape;

		const data = {
			width: v.getInt16(0, true),
			height: v.getInt16(2, true),
			frameDuration: v.getInt16(4, true),
			frames: []
		};

		for (let i = 6, l = buffer.byteLength; i < l; i += 2) {
			if (state === State.StartFrame) {
				currentFrame = { shapes: [] };
				data.frames.push(currentFrame);
				remainingShapes = v.getInt16(i, true);
				if (remainingShapes > 0) state = State.StartShape;
			} else if (state === State.StartShape) {
				currentShape = [];
				currentFrame.shapes.push(currentShape);
				remainingPoints = v.getInt16(i, true);
				if (remainingPoints > 0) state = State.AddPoints;
			} else if (state === State.AddPoints) {
				if (i + 2 >= l) break;
				const point = [ v.getInt16(i, true), v.getInt16(i + 2, true) ];
				i += 2;
				currentShape.push(point);
				if (--remainingPoints > 0) continue;
				state = --remainingShapes > 0 ? State.StartShape : State.StartFrame;
			}
		}

		// const bench = performance.now() - begin;
		// console.log('done in ' + bench + 'ms');

		return data;
	}

	return decode;
}

const decode = createDecoder();

export { createDecoder };
export { decode };
