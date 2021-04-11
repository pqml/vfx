import { Signal } from './signal';

class Readable extends Signal {
	constructor(initialValue) {
		super();
		this.current = initialValue;
	}

	get() {
		return this.current;
	}
}

export { Readable };
export default function readable(v) {
	return new Readable(v);
}
