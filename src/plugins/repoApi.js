import createRepository from '~/api/repo';

export default (ctx, inject) => {
	const repositoryWithAxios = createRepository(ctx.app.$api);
	inject('gApi', repositoryWithAxios('/api'));

	// You can reuse the repositoryWithAxios object:
	// inject("userRepository", repositoryWithAxios('/users'));
};
