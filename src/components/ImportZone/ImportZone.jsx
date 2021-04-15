import Store from '~/store';
import BaseComponent from '~/utils/components/BaseComponent/BaseComponent';
import getMime from '~/utils/getMime';
import importData from '~/utils/importData/importData';
import { holdStoreDispatches, releaseStoreDispatches } from '~/utils/state/index';
import Frame from '../Frame/Frame';

import './ImportZone.scss';

export default class ImportZone extends BaseComponent {
	template() {
		return <div class="import-zone">
			<input
				type="file"
				onChange={(e) => this.onChange(e)}
				accept=".json,.vfx,.vfx64,.jpg,.png,.gif"
				multiple
			/>
			<div class="content">
				<p>↳ Drag or click to import images and vfx files</p>
			</div>
		</div>;
	}

	async importImages(files) {
		let name = '';
		const promises = [];
		let images = {};

		for (let i = 0; i < files.length; i++) {
			const file = files[ i ];
			const ext = file.name.split('.').pop();
			const mime = getMime(ext);

			if (!mime.startsWith('image')) continue;
			const result = file.name.match(/^(.*[^0-9])([0-9]+)?\.([a-z]{2,4})$/i);
			if (!result) {
				console.warn(`${ file.name } cannot be used. Please use image with a naming like Image001.png`);
				continue;
			}

			promises.push(new Promise(resolve => {
				const index = result[ 2 ] || 0;
				name = result[ 1 ].trim();
				const reader = new FileReader();
				const img = document.createElement('img');
				img.onload = () => resolve(images[ index ] = img);
				reader.onload = () => {
					const blob = new Blob([ reader.result ]);
					img.src = URL.createObjectURL(blob, mime);
				};
				reader.readAsArrayBuffer(file);
			}));
		}

		await Promise.all(promises);

		images = Object.keys(images).sort().map(k => images[ k ]);

		if (!images.length) return;

		Store.sourceName.set(name);
		Store.sourceWidth.set(images[ 0 ].naturalWidth);
		Store.sourceHeight.set(images[ 0 ].naturalHeight);
		Store.frames.set(images.map(img => new Frame({ reference: img })));
	}

	async importData(files) {
		const promises = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[ i ];
			const ext = file.name.split('.').pop();
			if (ext !== 'json' && ext !== 'vfx' && ext !== 'vfx64') continue;
			promises.push(importData(file));
		}

		let datas = await Promise.all(promises);
		datas = datas.filter(Boolean);
		if (!datas) return;

		const data = datas[ datas.length - 1 ];
		if (data.name !== undefined) Store.sourceName.set(data.name);
		if (data.width) Store.sourceWidth.set(data.width);
		if (data.height) Store.sourceHeight.set(data.height);
		if (data.frameDuration) Store.frameDuration.set(data.frameDuration);
		if (data.frames) Store.frames.set(data.frames);
	}

	async onChange(e) {
		const files = e.target.files;

		try {
			holdStoreDispatches();
			await this.importImages(files);
			await this.importData(files);
		} finally {
			releaseStoreDispatches();
		}
	}
}
