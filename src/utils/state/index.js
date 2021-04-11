import readable from './readable';
import writable from './writable';
import computed from './computed';
import signal from './signal';
import freezer from './freezer';

const store = {};
const holdStoreDispatches = freezer.holdStoreDispatches;
const releaseStoreDispatches = freezer.releaseStoreDispatches;
const batchUpdates = freezer.batchUpdates;

export {
	readable as r,
	writable as w,
	computed as c,
	signal as s,
	readable,
	writable,
	computed,
	signal,
	holdStoreDispatches,
	releaseStoreDispatches,
	batchUpdates,
	store
};
