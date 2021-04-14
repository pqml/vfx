import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';

import './Logo.scss';

export default class Logo extends BaseComponent {
	template() {
		return <aside class="logo">
			<figure>
				<span>Ⓥ</span>
				<span>Ⓕ</span>
				<span>Ⓧ</span>
			</figure>
		</aside>;
	}
}
