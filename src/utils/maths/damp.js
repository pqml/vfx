export default function damp(a, b, smoothing, dt) {
	return lerp(a, b, 1 - Math.exp(-smoothing * dt));
}
