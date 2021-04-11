export default function ButtonLink(props) {
	const children = props.children;
	props.children = null;

	return h(
		typeof props.href !== 'undefined' ? 'a' : 'button',
		props,
		children
	);
}
