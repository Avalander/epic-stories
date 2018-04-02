const { Result, error_codes } = require('result')

const {
	validateCharacter,
	validateChapter,
	validatePost,
	validateStory,
} = require('validators')


const loginUser = (req, res) => ({ token, user }) =>
	res.cookie('bearer', token, { httpOnly: true })
		.json({ username: user.username, groups: user.groups })

const makePost = (payload, { user }, { story_id }) => Object.assign(
	{ created_on: Date.now() },
	payload,
	{ author: user, story_id },
	('_id' in payload ? { edited_on: Date.now() } : {}),
)

module.exports = ({ Router, signIn, authorise, registerUser, createStory, findStoriesByGroups, findStory, findStoryCharacters, findUserCharacters, findCharacter, saveCharacter, findStoryPosts, savePost, findLatestStoryPost, saveChapter }) => {
	const api = Router()

	api.post('/register/:token', (req, res, next) => {
		const { token } = req.params
		const { username, password } = req.body
		if (!username || !password || !token) return next(new Error('Invalid request.'))
		registerUser(username, password, token)
			.then(() => signIn(username, password))
			.then(loginUser(req, res))
			.catch(next)
	})

	api.post('/login', (req, res, next) => {
		const { username, password } = req.body
		if (!password) return next(new Error('User not found.'))
		signIn(username, password)
			.then(loginUser(req, res))
			.catch(next)
	})

	api.get('/user', authorise, (req, res, next) => res.json(Result.ok({
		username: req.bearer.user,
		groups: req.bearer.groups,
	})))

	/*
	api.get('/stories', authorise, (req, res, next) =>
		Promise.all([
			findStoriesByGroups(req.bearer.groups),
			findUserCharacters(req.bearer.user),
		])
		.then(([ stories, characters ]) => stories.map(s => Object.assign(s, {
			is_playing: characters.some(c => c.story_id == s._id)
		})))
		.then(stories => Promise.all(
			stories.map(x => findLatestStoryPost(x._id.toString())
				.then(({ author, created_on }) => Object.assign({}, x, { _latest: { author, created_on }}))
			)
		))
		.then(stories => res.json(Result.ok(stories)))
		.catch(e => res.json(Result.OTHER(e)))
	)

	api.get('/stories/:id', authorise, (req, res, next) => findStory(req.params.id)
		.then(story => res.json(Result.ok(story)))
		.catch(next)
	)
	*/

	api.get('/stories/:story_id/characters', authorise, (req, res, next) => findStoryCharacters(req.params.story_id)
		.then(characters => res.json(Result.ok(characters)))
	)

	api.get('/stories/:story_id/my-character', authorise, (req, res, next) => findCharacter(req.params.story_id, req.bearer.user)
		.then(character => character
			? res.json(Result.ok(character))
			: res.json(Result.NOT_FOUND(`${req.bearer.username} has no character in story ${req.params.story_id}.`))
		)
	)

	api.post('/stories/:story_id/my-character', authorise, (req, res, next) => Promise.resolve(Object.assign({}, req.body, { username: req.bearer.user }))
		.then(validateCharacter)
		.then(saveCharacter)
		.then(result => res.json(Result.ok(result)))
		.catch(error => res.json(Result.INVALID_DATA(error)))
	)

	api.get('/stories/:story_id/posts', authorise, (req, res, next) => findStoryPosts(req.params.story_id)
		.then(posts => res.json(Result.ok(posts)))
		.catch(e => res.json(Result.OTHER(e)))
	)

	api.post('/stories/:story_id/posts', authorise, (req, res, next) =>
		Promise.all([
			req.body.author && req.body.author !== req.bearer.user
				? Promise.reject('You can\'t edit somebody else\'s posts.')
				: Promise.resolve(makePost(req.body, req.bearer, req.params))
		])
		.then(([ x ]) => x)
		.then(validatePost)
		.then(savePost)
		.then(x => res.json(Result.ok(x)))
		.catch(e => res.json(Result.OTHER(e)))
	)

	/*
	api.post('/stories/:story_id/chapters', authorise, (req, res, next) =>
		Promise.all([
			req.params.story_id,
			validateChapter(req.body),
		])
		.then(([ story_id, chapter ]) => saveChapter(story_id, chapter))
		.then(x => res.json(Result.ok(x)))
		.catch(e => res.json(Result.OTHER(e)))
	)

	api.post('/stories', authorise, (req, res, next) =>
		Promise.resolve(Object.assign({}, req.body, { group: req.bearer.groups[0]}))
			.then(validateStory)
			.then(createStory)
			.then(({ insertedId }) => res.json(Result.ok({ insertedId })))
			.catch(e => res.json(Result.OTHER(e)))
	)
	*/

	return api
}