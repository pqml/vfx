import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import computed from '~/utils/state/computed';

import './EditorInfos.scss';

const Info = ({ label, value, classname }) => (
	<li class={"editor-info " + (classname || '')}>
		<div
			class="info-label"
			textContent={label}
		/>
		<div
			class="info-value"
			textContent={value}
		/>
	</li>);


export default class EditorInfos extends BaseComponent {
	beforeRender(props, state) {
		Object.assign(state, {
			resolution: computed(
				[ Store.sourceWidth, Store.sourceHeight ],
				(w, h) => w + ' x ' + h),
			frame: computed(
				[ Store.frameIndex, Store.framesCount ],
				(frame, total) => (frame + 1) + ' / ' + total
			),
			total: computed(
				[ Store.frame, Store.frames ],
				frame => frame
					? frame.shapes.length + ' / ' + frame.pointCount
					: '0 / 0'
			)
		});
	}

	template(props, { resolution, frame, total }) {
		return <section class="editor-infos">
			<ul>
				<Info
					label='Name'
					value={Store.sourceName}
				/>
				<Info
					label='Resolution'
					value={resolution}
				/>
				<Info
					classname="frame"
					label='Current Frame'
					value={frame}
				/>
				<Info
					classname="frame"
					label='Shapes / Points'
					value={total}
				/>
			</ul>
		</section>;
	}
}
