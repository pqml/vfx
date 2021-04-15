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
				<li class="editor-info input">
					<div class="info-label">
						Frame duration
					</div>
					<div class="info-value">
						<input
							value={Store.frameDuration}
							onKeyDown={this.bind('onFrameDurationKeyDown', 1)}
							onBlur={this.bind('onFrameDurationBlur', 1)}
						/>
					</div>
				</li>
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

	onFrameDurationKeyDown(e) {
		if (e.key === 'Enter') e.target.blur();
	}

	onFrameDurationBlur(e) {
		let value = e.target.value;
		value = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
		value = isNaN(value) || value < 10 || value > 2000 ? 30 : (+value);
		e.target.value = value;
		Store.frameDuration.set(value);
	}
}
