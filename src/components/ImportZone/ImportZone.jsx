import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import getMime from '~/utils/getMime';
import { holdStoreDispatches, releaseStoreDispatches } from '~/utils/state/index';
import Frame from '../Frame/Frame';

import './ImportZone.scss';

export default class ImportZone extends BaseComponent {
	template() {
		return <div class="import-zone">
			<input
				type="file"
				onChange={(e) => this.onChange(e)}
				multiple
			/>
			<div class="content">
				<p>Drag or click to import images</p>
			</div>
		</div>;
	}

	async onChange(e) {
		const promises = [];
		let images = {};
		let name = '';

		const files = e.target.files;
		for (let i = 0; i < files.length; i++) {
			const file = files[ i ];
			const result = file.name.match(/^(.*[^0-9])([0-9]+)?\.([a-z]{2,4})$/i);
			if (!result) {
				console.warn(`${ file.name } cannot be used. Please use image with a naming like Image001.png`);
				continue;
			}
			promises.push(new Promise(resolve => {
				name = result[ 1 ].trim();
				const index = result[ 2 ] || 0;
				const ext = result[ 3 ];
				const mime = getMime(ext);
				const reader = new FileReader();
				const img = document.createElement('img');
				// img.decoding = 'async';
				img.onload = () => {
					images[ index ] = img;
					resolve();
				};
				reader.onload = () => {
					const blob = new Blob([ reader.result ]);
					img.src = URL.createObjectURL(blob, mime);
				};
				reader.readAsArrayBuffer(file);
			}));
		}

		await Promise.all(promises);

		images = Object.keys(images).sort().map(k => images[ k ]);
		if (!images) {
			console.error('No image can be used.');
		}
		const width = images[ 0 ].naturalWidth;
		const height = images[ 0 ].naturalHeight;

		holdStoreDispatches();
		Store.sourceName.set(name);
		Store.sourceWidth.set(width);
		Store.sourceHeight.set(height);
		Store.frames.set(images.map(img => new Frame({ reference: img })));
		releaseStoreDispatches();
	}
}
