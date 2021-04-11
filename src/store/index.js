import { readonly, shallowRef, computed, reactive } from 'vue';

const store = reactive({
	currentGear: null,

	gearCategories: readonly([
		'Accessories',
		'Body',
		'BodyPaint',
		'Face',
		'Head',
		'Shoes'
	]),

	loading: false,

	list: shallowRef(null),

	appLoaded: computed(() => {
		return !!store.list;
	}),

	currentPreview: shallowRef(null)
});

export default store;
