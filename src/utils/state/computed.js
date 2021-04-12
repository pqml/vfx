import { Writable } from './writable';

function computed(observables, cb) {
	const value = new Writable();

	const setValue = value.set.bind(value);
	delete value.set;

	observables = Array.isArray(observables) ? observables : [ observables ];
	const values = new Array(observables.length);
	let unsubs = [];

	for (let i = 0, l = observables.length; i < l; i++) {
		const signal = observables[ i ];
			const cb = function ( v ) { values[ i ] = v; derive(); } // eslint-disable-line
		values[ i ] = signal.current;
		signal.subscribe(cb);
		unsubs.push(signal, cb);
	}


	value.destroy = destroy;
	derive();

	function derive() {
		const result = cb.apply(null, values);
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
