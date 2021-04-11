
// Some portions of code are taken from preact
// https://github.com/preactjs/preact/blob/master/src/diff/props.js

import extend from './extend';

const tempArray = [];

const XLINK_NS = 'http://www.w3.org/1999/xlink';

const namespaces = [
	'xlink',
	'xmlns',
	'xml'
];

// Some attribute doesn't work well when used inline as node.attr = value
// Replace by node.setAttribute
const useSetAttr = [
	'placeholder',
	'webkit-playsinline',
	'playsinline',
	'for',
	'selected',
	'list',
	'tagName',
	'type',
	'form',
	'size',
	'download',
	'href'
].reduce((p, c) => (p[ c ] = true, p), {});

const startsWith = (str, w) => str.substr(0, w.length) === w;

// toggle class using Store Signal
const toggleClass = n => (v, el) => el.classList.toggle(n, v || false);

// Update Attribute using Store Signal
const updateAttrib = function (el, name = 'textContent', isSvg) {
	const useXlink = name !== (name = name.replace(/^xlink:?/, ''));
	const isAria = !!/^ar/.test(name);
	const isData = startsWith(name, 'data-');
	const needSetAttr = isAria || isSvg || useSetAttr[ name ] || isData;
	const useInline = name in el && !needSetAttr;

	if (useXlink) {
		name = name.toLowerCase();
		return function (v, el) {
			if (v == null || v === false) el.removeAttributeNS(XLINK_NS, name);
			else el.setAttributeNS(XLINK_NS, name, v);
		};
	} else if (useInline) {
		return function (v, el) {
			el[ name ] = v == null ? '' : v;
		};
	} else {
		return function (v, el) {
			if (v == null || (v === false && isAria)) el.removeAttribute(name);
			else el.setAttribute(name, v);
		};
	}
};


function setDomAttrib(el, name, value, collector, isSvg) {
	// Don't treat undefined value
	if (value === undefined) return;

	// Ignore JSX sourcemap props
	if (name === '__self' || name === '__source' || name === 'ref') return;

	// Normalize class attribute
	if (name === 'className') name = 'class';
	if (name === 'text') name = 'textContent';

	// Correct attribute like xlmns:xlink
	for (let i = 0; i < namespaces.length; i++) {
		if (startsWith(name, namespaces[ i ])) {
			const len = namespaces[ i ].length;
			if (name[ len ] && name[ len ] !== ':') {
				name = (
					namespaces[ i ] +
					':' +
					name[ len ].toLowerCase() +
					name.substr(len + 1, name.length)
				);
			}
			break;
		}
	}

	if (name[ 0 ] === 'o' && name[ 1 ] === 'n') {
		// Handle dom events (inspired by preact code)
		// Synthetic DOM Events
		let eventName = name;
		const useCapture = eventName !== (eventName = eventName.replace(/Capture$/, ''));
		const nameLower = eventName.toLowerCase();
		if (nameLower in el) eventName = nameLower;
		eventName = eventName.slice(2);

		collector.append({ pendingListeners: [ {
			type: 'dom',
			el,
			evt: eventName,
			fn: value,
			capture: useCapture
		} ] });
	} else if (name === 'store') {
		// Super-method to bind store to function
		const evts = Array.isArray(value) ? value : [ value ];
		const events = [];

		for (let i = 0, l = evts.length; i < l; i++) {
			const evt = Array.isArray(evts[ i ]) ? evts[ i ] : [ evts[ i ] ];
			const store = evt[ 0 ];
			const fn = evt[ 1 ];
			const init = evt[ 2 ] !== undefined ? evt[ 2 ] : true;
			if (!store) continue;
			events.push({ type: 'store', store, fn, init, el });
		}

		collector.append({ pendingListeners: events });
	} else if (value && value._isStoreSignal) {
		// Update attribute using Store Signal (e.g. textContent={Store.text})
		let fn = false;
		const attr = name;

		// Special cases: class-className to toggle a class using a store signal
		if (startsWith(attr, 'class-')) fn = toggleClass(attr.substring(6));
		if (!fn) fn = updateAttrib(el, attr, isSvg);

		collector.append({ pendingListeners: [ {
			type: 'store',
			store: value,
			fn,
			el,
			init: true
		} ] });
	} else if (name === 'class' && !isSvg) {
		// Class - only for non-svg node
		if (typeof value === 'string') el.className = value || '';
		else if (typeof value === 'object') {
			tempArray.length = 0;
			for (const k in value) {
				const v = value[ k ];
				if (!v) continue;
				if (!v._isStoreSignal) tempArray.push(k);
				else {
					collector.append({ pendingListeners: [ {
						type: 'store',
						store: v,
						fn: toggleClass(k),
						el,
						init: true
					} ] });
				}
			}

			if (tempArray.length > 0)
				el.className = tempArray.join(' ');
		}
	} else if (name === 'style') {
		// Style attribute
		if (typeof value === 'object') extend(el.style, value);
		else if (typeof value === 'string') el.style.cssText = value;
	} else if (typeof value !== 'object' && typeof value !== 'function') {
		// Attrib
		// Attempt to set an attribute to the given value.
		// IE & FF throw for certain property-value combinations.
		try {
			updateAttrib(el, name, isSvg)(value, el);
		} catch (e) { /* */ }
	}
}

export default setDomAttrib;
