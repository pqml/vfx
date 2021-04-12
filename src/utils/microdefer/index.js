// Debounce and defer function call onto a microtask
export default function microdefer(cb, ctx) {
	if (ctx) cb = cb.bind(ctx);
	let called = false;

	let ta1 = null;
	let ta2 = null;
	let ta3 = null;

	function deffer() {
		called = false;
		const b1 = ta1;
		const b2 = ta2;
		const b3 = ta3;
		ta1 = ta2 = ta3 = null;
		cb(b1, b2, b3);
	}

	return function (a1, a2, a3) {
		ta1 = a1;
		ta2 = a2;
		ta3 = a3;

		if (called) return;
		called = true;
		Promise.resolve()
			.then(deffer)
			.catch(err => setTimeout(() => {
				throw err;
			}, 0));
	};
}
