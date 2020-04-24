export default function({ $axios }, inject) {
	// Create a custom axios instance
	const api = $axios.create({
		/* baseURL: url, */
		timeout: 30000,
		changeOrigin: true,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
			'Access-Control-Allow-Credentials': true
		}
	});

	// Set baseURL to something different
	/* api.setBaseURL(url); */

	// Inject to context as $api
	inject('api', api);
}
