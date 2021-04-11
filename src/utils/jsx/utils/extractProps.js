import { fastObject } from '@mm/fast';

const EMPTY = [];

export default function extractProps(props, extract = EMPTY, ignore = EMPTY) {
	const out = {};

	for (const k in props) {
		const extracts = extract.includes(k);
		const notIgnore = Array.isArray(ignore) && !ignore.includes(k);

		if ((ignore === true && extracts) || notIgnore) {
			out[ k ] = props[ k ];
		}

		if (extracts) {
			props[ k ] = undefined;
		}
	}
	return fastObject(out);
}
