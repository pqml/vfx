import { Writable } from './writable';

function computed(observables, cb) {
	const value = new Writable();

	const setValue = value.set.bind(value);
	delete value.set;

	const isArray = Array.isArray(observables);
	let values = isArray ? (new Array(observables.length)) : null;
	let unsubs = [];

	if (isArray) {
		for (let i = 0, l = observables.length; i < l; i++) {
			const signal = observables[ i ];
			const cb = function ( v ) { values[ i ] = v; derive(); } // eslint-disable-line
			values[ i ] = signal.current;
			signal.subscribe(cb);
			unsubs.push(signal, cb);
		}
	} else {
		const signal = observables;
		const cb = function ( v ) { values = v; derive(); } // eslint-disable-line
		values = signal.current;
		signal.subscribe(cb);
		unsubs.push(signal, cb);
	}

	value.destroy = destroy;
	derive();

	function derive() {
		const result = cb(values);
		if (result && result.then) result.then(setValue);
		else setValue(result);
	}

	function destroy() {
		for (let i = 0, l = unsubs.length; i < l; i += 2)
			unsubs[ i ].unsubscribe(unsubs[ i + 1 ]);

		unsubs = null;
		value.unsubscribeAll();
	}

	return value;
}

export default computed;
