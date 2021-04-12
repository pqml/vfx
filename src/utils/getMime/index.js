const mimes = {
	png: 'image/png',
	jpg: 'image/jpg',
	json: 'application/json',
	svg: 'image/svg+xml',
	glb: 'model/gltf-binary'
};

export default function getMime(ext) {
	return mimes[ ext ] || 'text/plain';
}
