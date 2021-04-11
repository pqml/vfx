export default function mod(dividend, divisor) {
	return ((dividend % divisor) + divisor) % divisor;
}
