import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import computed from '~/utils/state/computed';

import './EditorShortcuts.scss';

const Shortcut = ({ key, text }) => (
	<li class="shortcut">
		<figure textContent={key} />
		<span textContent={text} />
	</li>
);

export default class EditorShortcuts extends BaseComponent {
	beforeRender(props, state) {
	}

	template(props, state) {
		return <section
			class="editor-shortcuts"
			class-visible={Store.helpVisible}
		>
			<ul>
				<Shortcut
					key="H"
					text="Display shortcuts"
				/>
				<Shortcut
					key="S"
					text="Export sfx"
				/>
				<Shortcut
					key="Enter"
					text="Preview sfx"
				/>
				<Shortcut
					key="Space"
					text="Pan workspace"
				/>
				<Shortcut
					key="←&nbsp;→"
					text="Previous / next frame"
				/>
				<Shortcut
					key="Backspace / Z"
					text="Remove last point"
				/>
				<Shortcut
					key="Shift + Click"
					text="Start a new shape"
				/>
				<Shortcut
					key="W"
					text="Toggle wireframe mode"
				/>
				<Shortcut
					key="N"
					text="Toggle night mode"
				/>
			</ul>
		</section>;
	}
}
