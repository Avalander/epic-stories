const Future = require('fluture')
const { Result } = require('result')


module.exports = ({ Router, authorise, findStoryPosts, findChapterPosts, findDisplayNames, savePost, validatePost }) => {
	const api = Router()

	api.get('/stories/:story_id/posts', authorise, (req, res) =>
		findStoryPosts(req.params.story_id)
			.fold(x => x, posts => Result.ok(posts))
			.value(x => res.json(x))
	)

	api.post('/stories/:story_id/posts', authorise, (req, res) =>
		validateAuthor(req.body.author, req.bearer.user)
			.map(() => makePost(req.body, req.bearer.user, req.params))
			.chain(validatePost)
			.chain(savePost)
			.fold(x => x, y => Result.ok(y))
			.value(x => res.json(x))
	)

	api.get('/stories/:story_id/chapters/:chapter_id/posts', authorise, (req, res) =>
		Future.both(
			findChapterPosts(req.params.story_id, req.params.chapter_id),
			findDisplayNames(),
		)
		.map(([ posts, display_names ]) =>
			posts.map(x => Object.assign({}, x, {
				_display_name: display_names[x.author] || x.author,
			}))
		)
		.fold(x => x, posts => Result.ok(posts))
		.value(x => res.json(x))
	)

	api.post('/stories/:story_id/chapters/:chapter_id/posts', authorise, (req, res) =>
		validateAuthor(req.body.author, req.bearer.user)
			.map(() => makePost(req.body, req.bearer.user, req.params))
			.chain(validatePost)
			.chain(savePost)
			.fold(x => x, y => Result.ok(y))
			.value(x => res.json(x))
	)

	return api
}

const validateAuthor = (author, user) => (author && author !== user
	? Future.reject(Result.OTHER(`You can't edit somebody else's posts.`))
	: Future.of(user))

const makePost = (payload, author, { story_id, chapter_id }) => Object.assign(
	{ created_on: Date.now() },
	payload,
	{ author, story_id, chapter_id },
	'_id' in payload ? { edited_on: Date.now() } : {}
)
