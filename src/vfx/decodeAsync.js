import { createDecoder } from './decode';

const asyncWrap = '(' + (() => {
	const decode = createDecoder();
	addEventListener('message', e => {
		const uid = e.data.uid;
		const result = decode(e.data.source);
		postMessage({ uid, result });
	});
}).toString() + ')();';

const MAX_WORKERS = 3;
const WORKER_URL = getWorkerUrl(createDecoder);

const workers = new Array(MAX_WORKERS).fill().map(() => new Worker(WORKER_URL));
let requestIndex = 0;

function getWorkerUrl(fn) {
	const type = 'application/javascript';
	const blob = new Blob([ fn.toString() + asyncWrap ], { type });
	return URL.createObjectURL(blob);
}

export default function decode(source) {
	return new Promise(resolve => {
		const isBase64 = typeof source === 'string';

		// const begin = performance.now();
		const worker = workers.pop() || new Worker(WORKER_URL);
		const uid = requestIndex++;

		function onMessage(e) {
			if (e.data.uid !== uid) return;
			const data = e.data.result;

			worker.removeEventListener('message', onMessage);
			if (workers.length < MAX_WORKERS) workers.push(worker);
			else worker.terminate();

			// const bench = performance.now() - begin;
			// console.log('done in ' + bench + 'ms');
			resolve(data);
		}

		worker.addEventListener('message', onMessage);
		worker.postMessage(
			{ uid, source },
			isBase64 ? [] : [ source ]
		);
	});
}
