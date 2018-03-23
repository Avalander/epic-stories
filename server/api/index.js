const { Result, error_codes } = require('result')
const isValidCharacter = require('validator/character')
const isValidPost = require('validator/post')


const loginUser = (req, res) => ({ token, user }) =>
	res.cookie('bearer', token, { httpOnly: true })
		.json({ username: user.username, groups: user.groups })

module.exports = ({ Router, signIn, authorise, registerUser, createStory, findStoriesByGroups, findStory, findStoryCharacters, findCharacter, saveCharacter, findStoryPosts, savePost }) => {
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

	api.get('/stories', authorise, (req, res, next) => {
		const { groups } = req.bearer
		findStoriesByGroups(groups)
			.then(stories => res.json(Result.ok(stories)))
			.catch(next)
	})

	api.get('/stories/:id', authorise, (req, res, next) => findStory(req.params.id)
		.then(story => res.json(Result.ok(story)))
		.catch(next)
	)

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
		.then(isValidCharacter)
		.then(saveCharacter)
		.then(result => res.json(Result.ok(result)))
		.catch(error => res.json(Result.INVALID_DATA(error)))
	)

	api.get('/stories/:story_id/posts', authorise, (req, res, next) => findStoryPosts(req.params.story_id)
		.then(posts => res.json(Result.ok(posts)))
		.catch(e => res.json(Result.INVALID_DATA(e)))
	)

	api.post('/stories/:story_id/posts', authorise, (req, res, next) =>
		Promise.resolve(Object.assign({}, req.body, { author: req.bearer.user, created_on: Date.now(), story_id: req.params.story_id }))
			.then(isValidPost)
			.then(savePost)
			.then(x => res.json(Result.ok(x)))
			.catch(e => res.json(Result.INVALID_DATA(e)))
	)

	api.post('/stories', authorise, (req, res, next) => {
		const { title, description, group } = req.body
		if (!title || !group) {
			return res.json(Result.INVALID_DATA('Missing data.'))
		}
		createStory({ title, description, group })
			.then(({ insertedId }) => res.json(Result.ok({ insertedId })))
			.catch(next)
	})

	return api
}