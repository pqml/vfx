export function dispatch(component, cb, topDown) {
	const subs = component._collector && component._collector.components;
	if (topDown) cb(component);
	if (subs) {
		for (let i = 0; i < subs.length; i++) dispatch(subs[ i ], cb);
	}
	if (!topDown) cb(component);
}

function callRefs(component) {
	for (let i = 0; i < component._collector.refs.length; i++) {
		component._collector.refs[ i ].fn(component._collector.refs[ i ].ref);
		// Is this really needed or a good thing ?
		component._collector.refs[ i ].ref = null;
	}
}

export function dispatchRefs(component) {
	dispatch(component, callRefs);
}

function callListeners(component) {
	for (let i = component._collector.pendingListeners.length - 1; i >= 0; i--) {
		const listener = component._collector.pendingListeners.splice(i, 1)[ 0 ];
		component._collector.listeners.push(listener);
		if (listener.type === 'dom') {
			listener.el.addEventListener(listener.evt, listener.fn, listener.capture);
		} else if (listener.type === 'store') {
			const oldfn = listener.fn;
			listener.fn = function ( v ) { oldfn( v, listener.el  ) }; // eslint-disable-line
			listener.store.subscribe(listener.fn);
			if (listener.init) listener.fn(listener.store.current);
		}
	}
}

export function dispatchListeners(component) {
	dispatch(component, callListeners);
}
