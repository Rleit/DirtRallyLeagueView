import { key } from '../config/index.js';

export default ($api) => (resource) => ({
	// index() {
	// 	return $api.$get(`${resource}/${id.id}`, { params: { key }, progress: true });
	// },

	seasons(id) {
		return $api.$get(`${resource}/${id.id}/values/${id.sheet}${id.range}`, { params: { key }, progress: true });
	},

	events(name, id, sheet, range) {
		return $api.$get(`${resource}/${id}`);
	}

	// stages(stage) {
	//   return $axios.$post(`${resource}`, payload)
	// },
});
