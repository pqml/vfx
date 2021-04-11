import rawRender from './utils/rawRender';
import { dispatchListeners, dispatchRefs, dispatch } from './utils/dispatch';

let lastRenderID = 0;

export default function render(vnode, parent, context) {
	// render
	lastRenderID++;
	let i = 0;

	const isSvg = parent && (parent.tagName === 'SVG' || parent instanceof SVGElement);
	const rendered = rawRender(vnode, isSvg);

	// dispatch callback refs
	let mockComponent = { _collector: rendered }; // for dispatch convenience
	dispatchRefs(mockComponent);

	// dispatch afterRender
	dispatch(mockComponent, function (c) {
		c.afterRender && c.afterRender(c.props, c.state);
	});

	// mount
	if (typeof parent === 'function') {
		const nodes = rendered.nodes.length < 2 ? rendered.nodes[ 0 ] : rendered.nodes;
		parent(nodes);
	} else if (parent) {
		for (i = 0; i < rendered.nodes.length; i++) {
			parent.appendChild(rendered.nodes[ i ]);
		}
	}

	// This conditionnal avoids calling the dispatchers twice if
	// the renders is made during before / after render
	if (!context || context.mounted) {
		// Dispatch listeners
		let currentRenderID = lastRenderID;
		let rerenderingCount = 0;
		dispatchListeners(mockComponent);
		while (currentRenderID !== lastRenderID) {
			if (++rerenderingCount > 10) {
				console.warn('Too many re-rendering from store- attributes');
				break;
			}
			currentRenderID = lastRenderID;
			dispatchListeners(mockComponent);
		}

		// dispatch afterMounts
		dispatch(mockComponent, function (c) {
			c.mounted = true;
			c.afterMount && c.afterMount(c.props, c.state);
		});
	}

	// Add items to context
	if (context && context._collector) {
		const c = context._collector;

		for (i = 0; i < rendered.components.length; i++) {
			rendered.components[ i ]._parent = context;
		}

		if (c.refs) c.refs = c.refs.concat(rendered.refs);
		if (c.components) c.components = c.components.concat(rendered.components);
		if (c.pendingListeners) c.pendingListeners = c.pendingListeners.concat(rendered.pendingListeners);
		if (c.listeners) c.listeners = c.listeners.concat(rendered.listeners);
	}

	mockComponent = undefined;
	return rendered;
}
