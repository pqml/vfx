export default function Reusable({ list, index, children }) {
	const child = children[ 0 ];
	const cached = list[ index ];

	if (cached) {
		if (cached.base) {
			if (cached.afterPropsUpdate) {
				const newProps = child.props;
				if (newProps) delete newProps.ref;
				const prevProps = Object.assign({}, cached.props);
				Object.assign(cached.props, newProps);
				cached.afterPropsUpdate(cached.props, prevProps);
			}

			return cached.base;
		}

		return cached;
	}

	const originalRef = child.props.ref;
	child.props.ref = el => {
		if (!el) delete list[ index ];
		else list[ index ] = el;
		if (originalRef) originalRef(el);
	};

	return child;
}

Reusable.cacheParent = (parent) => (el) => {
	if (el.parentNode === parent) return;
	parent.appendChild(el);
};
