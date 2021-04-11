export default function addRef( obj, key ) {

	return function ( ref ) {

		obj[ key ] = ref;

	};

}
