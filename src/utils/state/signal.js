function SignalListener(owner, fn, ctx, once) {
	this.fn = fn;
	this.ctx = ctx || null;
	this.owner = owner;
	this.once = !!once;
}

function removeNode(owner, node) {
	if (node.prev) node.prev.next = node.next;
	if (node.next) node.next.prev = node.prev;
	node.ctx = node.fn = node.owner = null;
	if (node === owner._first) owner._first = node.next;
	if (node === owner._last) owner._last = node.prev;
}

class Signal {
	constructor() {
		this._first = this._last = null;
		this._isStoreSignal = true;
	}

	dispatch(a0, a1, a2, a3, a4) {
		let node = this._first;
		while (node) {
			node.fn.call(node.ctx, a0, a1, a2, a3, a4);
			node.once && this.unsubscribe(node);
			node = node.next;
		}
	}

	subscribe(fn, ctx, once) {
		const node = new SignalListener(this, fn, ctx, once);
		if (!this._first) {
			this._first = node;
			this._last = node;
		} else {
			this._last.next = node;
			node.prev = this._last;
			this._last = node;
		}
		return node;
	}

	subscribeOnce(fn, ctx) {
		return this.subscribe(fn, ctx, true);
	}

	unsubscribe(fn, ctx) {
		if (fn instanceof SignalListener) return removeNode(this, fn);
		if (!ctx) ctx = null;
		let node = this._first;
		while (node) {
			if (node.fn === fn && node.ctx === ctx) removeNode(this, node);
			node = node.next;
		}
	}

	unsubscribeAll() {
		let node = this._first;
		this._first = this._last = null;
		while (node) {
			removeNode(this, node);
			node = node.next;
		}
	}
}

export { Signal };
export default function signal() {
	return new Signal();
}
