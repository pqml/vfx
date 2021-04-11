const EMPTY = [];

export default function filterProps(props, exclude = EMPTY) {
	for (const k in props) {
		if (exclude.includes(k)) {
			props[ k ] = undefined;
		}
	}

	return props;
}
