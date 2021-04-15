function arrayBufferToBase64(buffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[ i ]);
	}
	return window.btoa(binary);
}

export function encode(obj, opts = {}) {
	const arr = [];
	arr.push(obj.width);
	arr.push(obj.height);
	arr.push(obj.frameDuration || 30);

	for (let i = 0, l = obj.frames.length; i < l; i++) {
		const frame = obj.frames[ i ];
		const shapes = frame.shapes || [];
		arr.push(shapes.length);
		for (let i2 = 0, l2 = shapes.length; i2 < l2; i2++) {
			const points = shapes[ i2 ];
			arr.push(points.length);
			for (let i3 = 0, l3 = points.length; i3 < l3; i3++) {
				const point = points[ i3 ];
				arr.push(point[ 0 ], point[ 1 ]);
			}
		}
	}

	const byteLength = 2; // int16 is enough
	const buffer = new ArrayBuffer(arr.length * byteLength);
	const data = new DataView(buffer);
	for (let i = 0, l = arr.length; i < l; i++) {
		data.setInt16(i * byteLength, parseInt(arr[ i ]), true);
	}

	return opts.base64
		? arrayBufferToBase64(buffer)
		: new Blob([ buffer ], { type: 'application/octet-stream' });
}

window.encode = encode;
