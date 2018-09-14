import { fetchJson } from 'App/fx'


export default () =>
	({
		fetchStory: story_id =>
			fetchJson(
				`/api/stories/${story_id}`,
				'onFetchStorySuccess',
				'onApiError'
			),
		onFetchStorySuccess: ({ result }) => state =>
			({
				...state,
				story: result,
			}),
		onApiError: ({ error }) =>
			console.error(error),
	})
