import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import computed from '~/utils/state/computed';

import './EditorPreview.scss';
import sfx from './sfx';

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
		if (this.sfx) this.sfx.destroy();
		this.sfx = null;
		if (!data) return;
		this.sfx = sfx.create({
			data,
			loop: true,
			parent: this.refs.wrapper,
			color: Store.nightMode.current ? '#ffffff' : '#000000',
			size: 400
		});
	}

	beforeDestroy() {
		if (this.sfx) this.sfx.destroy();
		this.sfx = null;
	}
}
