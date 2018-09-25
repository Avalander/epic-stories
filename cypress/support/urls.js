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
		detail: id => `/stories/${id}`,
		chapters: id => `/stories/${id}/chapters`,
		posts: (story_id, chapter_id) => `/stories/${story_id}/chapters/${chapter_id}/posts`,
		characters: id => `/stories/${id}/characters`,
		myCharacter: id => `/stories/${id}/my-character`,
	},
}