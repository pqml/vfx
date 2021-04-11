const obj = {
	value: 0
};

export default obj;

export function getDomListenerCount() {
	return obj.value;
}

/// #if DEBUG
window._domListeners = getDomListenerCount;
/// #endif
