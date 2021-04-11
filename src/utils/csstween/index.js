// Version 1.1

let uuid = 0;

const def = (prop, common) => prop !== undefined ? prop : common;
const createUID = () => ++uuid;
const activeTweens = new Map();
const willChangeProps = new Set([ 'opacity', 'transform' ]);
const reservedProps = new Set([ 'target', 'ease', 'duration', 'delay', 'willChange' ]);

export const easingsArray = [
	[ 'linear', [ 0.250, 0.250, 0.750, 0.750 ]],
	[ 'inSine', [ 0.470, 0.000, 0.745, 0.715 ]],
	[ 'outSine', [ 0.390, 0.575, 0.565, 1.000 ]],
	[ 'inOutSine', [ 0.445, 0.050, 0.550, 0.950 ]],
	[ 'inQuad', [ 0.550, 0.085, 0.680, 0.530 ]],
	[ 'outQuad', [ 0.250, 0.460, 0.450, 0.940 ]],
	[ 'inOutQuad', [ 0.455, 0.030, 0.515, 0.955 ]],
	[ 'inCubic', [ 0.550, 0.055, 0.675, 0.190 ]],
	[ 'outCubic', [ 0.215, 0.610, 0.355, 1.000 ]],
	[ 'inOutCubic', [ 0.645, 0.045, 0.355, 1.000 ]],
	[ 'inQuart', [ 0.895, 0.030, 0.685, 0.220 ]],
	[ 'outQuart', [ 0.165, 0.840, 0.440, 1.000 ]],
	[ 'inOutQuart', [ 0.770, 0.000, 0.175, 1.000 ]],
	[ 'inQuint', [ 0.755, 0.050, 0.855, 0.060 ]],
	[ 'outQuint', [ 0.230, 1.000, 0.320, 1.000 ]],
	[ 'inOutQuint', [ 0.860, 0.000, 0.070, 1.000 ]],
	[ 'inExpo', [ 0.950, 0.050, 0.795, 0.035 ]],
	[ 'outExpo', [ 0.190, 1.000, 0.220, 1.000 ]],
	[ 'inOutExpo', [ 1.000, 0.000, 0.000, 1.000 ]],
	[ 'inCirc', [ 0.600, 0.040, 0.980, 0.335 ]],
	[ 'outCirc', [ 0.075, 0.820, 0.165, 1.000 ]],
	[ 'inOutCirc', [ 0.785, 0.135, 0.150, 0.860 ]]
];

const customEases = {
	outSwift: 'cubic-bezier(0.55, 0, 0.1, 1)',
	snap2: 'cubic-bezier(0, 0.975, 0, 1)',
	bounce: 'cubic-bezier(.18, .89, .34, 1.76)',
	bounce2: 'cubic-bezier(0.865, -0.005, 0, 1.47)',
	hardBounce: 'cubic-bezier(0.070, 1.525, 0.360, 0.935)',
	longKeyframe: 'cubic-bezier(.49, .05, .32, 1.04)',
	elastic: 'cubic-bezier(0, .49, .205, 1)'
};

easingsArray
	.forEach(c => (customEases[ c[ 0 ] ] = `cubic-bezier(${ c[ 1 ].join(',') })`));

function transition(prop, duration = 1000, easing = 'linear', delay = 0) {
	if (customEases[ easing ]) easing = customEases[ easing ];
	const ease = Array.isArray(easing)
		? `cubic-bezier(${ easing.join(',') })`
		: easing;

	return `${ prop } ${ duration }ms ${ ease } ${ delay }ms`;
}

export default function csstween(props = {}) {
	// Gather options
	let onComplete = props.complete;
	const instant = !!props.instant;
	const useWillChange = !!props.willChange;
	const target = props.target;

	const common = {
		easing: props.easing || 'linear',
		duration: props.duration || 1000,
		delay: props.delay || 0
	};

	// Get element uid
	if (!target.dataset.csstween) target.dataset.csstween = createUID();
	const uid = target.dataset.csstween;

	let completePromise = null;
	let finished = new Promise(resolve => completePromise = resolve);

	if (props.queue) props.queue.push(finished);

	const api = { destroy, stop: destroy, finished };
	const activeProps = new Set();

	let emergencyTimer = null;
	let destroyed = false;

	play();
	return api;

	function play() {
		if (destroyed) return {};

		// Remove current tween for this target
		if (activeTweens.has(uid)) activeTweens.get(uid).destroy();

		// Register tween
		activeTweens.set(uid, api);

		const willChangeEls = [];
		const transitions = [];
		const from = {};
		const to = {};

		let maxDuration = 0;

		// COMPUTE TWEEN
		for (const propname in props) {
			if (reservedProps.has(propname)) continue;
			else if (target.style[ propname ] === undefined) continue;

			const el = props[ propname ];

			if (el === null || el === undefined) continue;

			const prop = typeof el === 'object' && !Array.isArray(el)
				? el
				: { value: el };

			// Append transition settings
			const duration = def(prop.duration, common.duration);
			const delay = def(prop.delay, common.delay);
			const ease = def(prop.easing, common.easing);
			transitions.push(transition(propname, duration, ease, delay));

			maxDuration = Math.max(maxDuration, duration + delay);

			// Create from / to values
			const value = Array.isArray(prop.value)
				? prop.value
				: [ null, prop.value ];

			// Handle instant tweens
			if (
				instant ||
				(delay <= 0 && (!duration || duration <= 0))
			) {
				value[ 0 ] = value[ 1 ];
				value[ 1 ] = null;
			}

			if (value[ 0 ] !== null) from[ propname ] = value[ 0 ];
			if (value[ 1 ] !== null) to[ propname ] = value[ 1 ];

			if (willChangeProps.has(propname)) willChangeEls.push(propname);
		}

		// PLAY TWEEN

		// Prepare will change if needed
		if (useWillChange && willChangeEls.length > 0) {
			target.style.willChange = willChangeEls.join(', ');
		}

		// From tween
		if (Object.keys(from).length > 0) {
			for (const prop in from) target.style[ prop ] = from[ prop ];
			target.getBoundingClientRect();
		}

		// To tween
		if (Object.keys(to).length > 0) {
			target.style.transition = transitions.join(', ');
			target.getBoundingClientRect();

			for (const prop in to) {
				target.style[ prop ] = to[ prop ];
				activeProps.add(prop);
			}

			target.addEventListener('transitionend', onTransitionEnd);
			target.addEventListener('webkitTransitionEnd', onTransitionEnd);

			emergencyTimer = window.setTimeout(finish, maxDuration * 1.1 + 200);
		} else {
			finish();
		}
	}

	function finish() {
		if (destroyed) return;
		window.clearTimeout(emergencyTimer);
		if (onComplete) onComplete();
		completePromise();
		destroy();
	}

	function onTransitionEnd(e) {
		target.style.willChange = '';
		activeProps.delete(e.propertyName);
		if (activeProps.size < 1) finish();
	}

	function destroy() {
		if (destroyed) return;
		window.clearTimeout(emergencyTimer);
		emergencyTimer = null;
		target.style.transition = '';
		target.removeEventListener('transitionend', onTransitionEnd);
		target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
		activeTweens.delete(uid);
		activeProps.clear();
		finished = null;
		onComplete = null;
		completePromise = null;
		destroyed = true;
	}
}
