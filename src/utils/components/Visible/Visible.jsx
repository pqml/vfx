import { Component } from '../../jsx';

export default class Visible extends Component {
	afterCreation() {
		this.previous = null;
		this.current = null;
		this.then = null;
		this.else = null;
	}

	template() {
		const c = document.createComment(" ");
		return c;
	}

	afterMount(props) {
		this.storeSubscribe(props.if, this.onIf);
	}

	onIf(v) {
		this.previous = this.current;

		if (v) {
			if (!this.then) this.then = this.render(this.props.then);
			this.current = this.then;
		} else {
			if (!this.else) this.else = this.render(this.props.else);
			this.current = this.else;
		}

		if (this.current) {
			const nodes = this.current.nodes;
			for (let i = nodes.length - 1; i >= 0; i--) {
				const item = nodes[ i ];
				this.base.parentNode.insertBefore(item, this.base);
			}
			const components = this.current.components;
			for (let i = 0; i < components.length; i++) {
				const item = components[ i ];
				if (item.detached) item.detached();
			}
		}

		if (this.previous) {
			const nodes = this.previous.nodes;
			for (let i = 0; i < nodes.length; i++) {
				const item = nodes[ i ];
				item.parentNode && item.parentNode.removeChild(item);
			}
			const components = this.current.components;
			for (let i = 0; i < components.length; i++) {
				const item = components[ i ];
				if (item.attached) item.attached();
			}
		}
	}
}
