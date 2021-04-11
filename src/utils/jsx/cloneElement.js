import h from './h';
import extend from './utils/extend';

export default function cloneElement(vnode, props) {
	return h(
		vnode.nodeName,
		extend(extend({}, vnode.props), props),
		arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children
	);
}
