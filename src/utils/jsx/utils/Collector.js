
const TYPES = [ 'nodes', 'components', 'refs', 'pendingListeners', 'listeners' ];

export default class Collector {
	constructor() {
		this.data = {};
		for (let i = 0; i < TYPES.length; i++) {
			this.data[ TYPES[ i ] ] = [];
		}
	}

	append(obj) {
		for (const k in obj) {
			this.data[ k ] = this.data[ k ].concat(obj[ k ]);
		}
	}

	set(obj) {
		for (const k in obj) {
			this.data[ k ] = obj[ k ];
		}
	}

	get() {
		return this.data;
	}
}
