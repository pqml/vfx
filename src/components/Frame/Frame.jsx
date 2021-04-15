import Store from '~/store';
import microdefer from '~/utils/microdefer';

const triggerUpdate = microdefer(() => {
	Store.frames.set(Store.frames.current, true);
});

export default class Frame {
	constructor({ reference }) {
		this.reference = reference;
		this.shapes = [];
		this.shapeIndex = -1;
	}

	get pointCount() {
		let count = 0;
		this.shapes.forEach(shape => count += shape.length);
		return count;
	}

	get shapePointCount() {
		if (this.shapeIndex < 0) return 0;
		return this.shapes[ this.shapeIndex ].length;
	}

	addShape() {
		if (this.shapeIndex >= 0) {
			const shape = this.shapes[ this.shapeIndex ];
			if (shape.length < 3) return;
		}
		this.shapeIndex++;
		this.shapes.push([]);
		triggerUpdate();
		Store.keyPressed.current.SHIFT = false;
		Store.keyPressed.set(Store.keyPressed.current, true);
	}

	removeShape() {
		if (this.shapeIndex < 0) return;
		this.shapes.pop();
		this.shapeIndex--;
		triggerUpdate();
	}

	removePoint() {
		if (this.shapeIndex < 0) return;
		const points = this.shapes[ this.shapeIndex ];
		if (points.length < 1) {
			this.removeShape();
			this.removePoint();
			return;
		} else {
			points.pop();
			triggerUpdate();
			if (points.length < 1) this.removeShape();
		}
	}

	addPoint(x, y) {
		const shiftPressed = !!Store.keyPressed.current.SHIFT;
		const spacePressed = !!Store.keyPressed.current.SPACE;
		if (spacePressed) return;
		if (this.shapeIndex < 0 || shiftPressed) this.addShape();
		const points = this.shapes[ this.shapeIndex ];
		points.push([ x, y ]);
		triggerUpdate();
	}
}
