export default {
	register: token =>
		(token
			? `/register.html?token=${token}`
			: '/register.html'
		),
	login: '/login.html',
	welcome: '/welcome',
	home: '/stories',
	stories: {
		list: () => '/stories',
		chapters: id => `/stories/${id}/chapters`,
		posts: (story_id, chapter_id) => `/stories/${story_id}/chapters/${chapter_id}/posts`,
	},
}