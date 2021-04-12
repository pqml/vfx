import { fastObject } from '~/utils/fast';

export default function joinClasses(...classes) {
	let needsObject = false;
	const collector = [];

	for (let i = 0, l = classes.length; i < l; i++) {
		const c = classes[ i ];
		if (!c) continue;
		collector.push(c);
		needsObject |= (typeof c === 'object');
	}

	// Only strings, we can safely concat all class strings
	if (!needsObject) return collector.join(' ');

	// There is objects ! needs additional step
	const out = {};
	for (let i = 0, l = collector.length; i < l; i++) {
		const classes = collector[ i ];
		if (typeof classes === 'string') {
			// Split each string to get individual classes and add them to the output
			const strs = classes.split(' ');
			for (let j = 0, k = collector.length; j < k; j++) {
				const str = strs[ j ];
				if (str === undefined || str.length < 1) continue;
				out[ str ] = true;
			}
		} else {
			// Get all property of an object and add them to the output
			for (const k in classes) out[ k ] = classes[ k ];
		}
	}

	return fastObject(out);
}
