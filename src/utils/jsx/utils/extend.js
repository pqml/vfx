export default function extend(obj, nObj) {
	for (const i in nObj) obj[ i ] = nObj[ i ];
	return obj;
}
