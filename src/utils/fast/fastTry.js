export default function fastTry(fn) {
	try {
		return fn();
	} catch (e) {
		if (!(e instanceof Error)) {
			return new Error(e);
		} else {
			return e;
		}
	}
}
