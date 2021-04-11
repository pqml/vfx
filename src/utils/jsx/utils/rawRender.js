
import Collector from './Collector';
import setDomAttrib from './setDomAttrib';
import extend from './extend';

function arr(e) {
	return Array.isArray(e) ? e : [ e ];
}

// ---- RAW RENDERER ----
function rawRender(vdom, isSvg) {
	if (Array.isArray(vdom)) return renderArray(vdom, isSvg);
	if (
		vdom instanceof window.Element ||
		vdom instanceof window.Comment
	) return renderDirectDom(vdom, isSvg);


	if (
		vdom === null ||
		typeof vdom !== 'object' ||
		!vdom.vnode
	) return renderPrimitive(vdom, isSvg);

	// one-level deep flatten children array
	const props = extend(
		extend({}, vdom.props),
		{ children: [].concat.apply([], vdom.children || []) }
	);

	if (vdom.isDom) return renderDom(vdom, props, isSvg);
	if (vdom.isInstance) return renderClass(vdom, props, isSvg, true);
	if (vdom.isStateless) return renderStateless(vdom, props, isSvg);
	if (vdom.isComponent) return renderClass(vdom, props, isSvg);
}

// ---- ARRAY ----
function renderArray(vdoms, isSvg) {
	vdoms = arr(vdoms);
	const collector = new Collector();
	for (let i = 0; i < vdoms.length; i++) {
		collector.append(rawRender(vdoms[ i ], isSvg));
	}
	return collector.get();
}

// ---- PRIMITIVE ----
function renderPrimitive(vdom) {
	const collector = new Collector();

	if (vdom === null || vdom === undefined || vdom === false) return collector.get();
	collector.append({ nodes: document.createTextNode(vdom + '') });
	return collector.get();
}

// ---- DOM ----
function renderDom(vdom, props, isSvg) {
	// Render and collect vdom's children
	const collector = new Collector();
	let domChildren = [];

	if (vdom.type === 'svg') isSvg = true;

	for (let i = 0; i < props.children.length; i++) {
		const result = rawRender(props.children[ i ], isSvg);
		if (result.nodes) {
			domChildren = domChildren.concat(result.nodes);
			collector.append({
				components: result.components,
				refs: result.refs,
				pendingListeners: result.pendingListeners,
				listeners: result.listeners
			});
		}
	}

	// Create dom element
	const el = isSvg
		? document.createElementNS('http://www.w3.org/2000/svg', vdom.type)
		: document.createElement(vdom.type);

	for (const k in vdom.props) {
		setDomAttrib(el, k, vdom.props[ k ], collector, isSvg);
	}

	for (let i = 0; i < domChildren.length; i++) {
		el.appendChild(domChildren[ i ]);
	}

	if (props.ref) collector.append({ refs: { ref: el, fn: props.ref } });
	collector.append({ nodes: el });

	return collector.get();
}

// ---- DIRECT DOM ----
function renderDirectDom(vdom) {
	const collector = new Collector();
	collector.append({ nodes: vdom });
	return collector.get();
}

// ---- STATELESS ----
function renderStateless(_vdom, props, isSvg) {
	const collector = new Collector();
	const vdom = _vdom.type(props);
	collector.append(rawRender(vdom, isSvg));
	return collector.get();
}

// ---- CLASS ----
function renderClass(_vdom, props, isSvg, isInstance = false) {
	const collector = new Collector();

	// instanciate it and call beforeRender
	const instance = isInstance ? _vdom.type : new _vdom.type(props) // eslint-disable-line
	// props = instance.props;

	instance.beforeRender(instance.props, instance.state);
	const vdom = instance.template(instance.props, instance.state);

	// append its own ref ? not sur if I need to do this here or in the collector reset
	if (props.ref) collector.append({ refs: { ref: instance, fn: props.ref } });
	collector.append(rawRender(vdom, isSvg));

	// create a useful "base" property
	const nodes = collector.data.nodes;
	instance.base = nodes.length > 1 ? nodes : nodes[ 0 ];

	// collect all sub refs / components and add them to the instance's own collector
	// instance._collector = {}

	for (const k in collector.data) {
		if (k === 'nodes') continue;
		if (!instance._collector[ k ]) instance._collector[ k ] = [];
		instance._collector[ k ] = instance._collector[ k ]
			.concat(collector.data[ k ]);
	}

	// reset the collector (collector.components only contains the current instance)
	// used for possible parents and for correct didmount / refs dispatching
	collector.set({
		components: [ instance ],
		refs: [],
		pendingListeners: [],
		listeners: []
	});

	// add a parent "private" property to each sub-components
	for (let i = 0; i < instance._collector.components.length; i++) {
		instance._collector.components[ i ]._parent = instance;
	}

	return collector.get();
}

export default rawRender;
