let hold = false;
const stack = new Set();

function holdStoreDispatches() {
	hold = true;
}

function releaseStoreDispatches() {
	hold = false;
	stack.forEach(dispatch);
	stack.clear();
}

function dispatch(signal) {
	signal._dispatch();
}

function batchUpdates(cb) {
	return function (a, b, c) {
		holdStoreDispatches();
		cb(a, b, c);
		releaseStoreDispatches();
	};
}

export default {
	stack,
	isHold: () => hold,
	holdStoreDispatches,
	releaseStoreDispatches,
	batchUpdates
};
