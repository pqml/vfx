import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import computed from '~/utils/state/computed';

import './EditorInfos.scss';

class Input extends BaseComponent {
	template({ value }) {
		return <input
			class={this.props.validation}
			value={value}
			onKeyDown={this.bind('keydown', 1)}
			onBlur={this.bind('submit', 1)}
		/>;
	}

	keydown(e) {
		const validation = this.props.validation;

		if (e.key === 'Enter') e.target.blur();
		else if (validation === 'number' && e.key === 'ArrowDown') {
			e.preventDefault();
			this.updateValue(this.props.value.current - 1);
		} else if (validation === 'number' && e.key === 'ArrowUp') {
			e.preventDefault();
			this.updateValue(this.props.value.current + 1);
		}
	}

	updateValue(value) {
		const validation = this.props.validation;
		const oldValue = this.base.value;
		value = value.toString();

		if (validation === 'number') {
			const max = this.props.max || 3000;
			const min = this.props.min || 0;
			value = value.replace(/,/g, '.').replace(/[^0-9.-]/g, '');
			value = isNaN(value) ? value : (+value);
			value = Math.min(max, Math.max(min, value));
		} else if (validation === 'name') {
			value = value.replace(/[^a-z0-9._-]/ig, '');
		}

		if (oldValue !== value) this.base.value = value;
		this.props.value.set(value);
	}

	submit(e) {
		this.updateValue(e.target.value);
	}
}

const Info = ({ label, value, input, min, max, validation, classname }) => (
	<li class={"editor-info " + (classname || '')}>
		<div
			class="info-label"
			textContent={label}
		/>
		{
			input
				? <div class="info-value">
					<Input
						value={input}
						min={min}
						max={max}
						validation={validation}
					/>
				</div>
				: <div
					class="info-value"
					textContent={value}
				/>
		}
	</li>);


export default class EditorInfos extends BaseComponent {
	beforeRender(props, state) {
		this.bind('submit', 1);

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

	template(props, { frame, total }) {
		return <section class="editor-infos">
			<ul>
				<Info
					classname='input'
					label='Name'
					input={Store.sourceName}
					validation="name"
				/>
				<Info
					label='Width'
					input={Store.sourceWidth}
					validation="number"
				/>
				<Info
					label='Height'
					input={Store.sourceHeight}
					validation="number"
				/>
				<Info
					label='Frame duration'
					min={10}
					input={Store.frameDuration}
					validation="number"
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
