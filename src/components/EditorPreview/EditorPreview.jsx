import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import computed from '~/utils/state/computed';
import vfx from '~/vfx';

import './EditorPreview.scss';

export default class EditorPreview extends BaseComponent {
	beforeRender(props, state) {
		Object.assign(state, {
			visible: computed(Store.previewData, data => !!data)
		});
	}

	template(props, { visible }) {
		return <section
			class="editor-preview"
			class-visible={visible}
		>
			<div
				class="preview-wrapper"
				ref={this.ref("wrapper")}
			/>
		</section>;
	}

	afterMount() {
		this.storeSubscribe(Store.previewData, this.onPreview);
	}

	onPreview(data) {
		if (this.vfx) this.vfx.destroy();
		this.vfx = null;
		if (!data) return;
		this.vfx = vfx.create({
			data,
			loop: true,
			parent: this.refs.wrapper,
			color: Store.nightMode.current ? '#ffffff' : '#000000',
			size: 400
		});
	}

	beforeDestroy() {
		if (this.vfx) this.vfx.destroy();
		this.vfx = null;
	}
}
