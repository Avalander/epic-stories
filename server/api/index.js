const fs = require('fs')

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

const makePost = (payload, { user }, { story_id, chapter_id }) => Object.assign(
	{ created_on: Date.now() },
	payload,
	{ author: user, story_id, chapter_id },
	('_id' in payload ? { edited_on: Date.now() } : {}),
)

module.exports = ({ IMAGES_FOLDER, Router, signIn, authorise, registerUser, createStory, findStoriesByGroups, findStory, findStoryCharacters, findUserCharacters, findCharacter, saveCharacter, findStoryPosts, savePost, findLatestStoryPost, saveChapter, findChapterPosts }) => {
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

	api.get('/stories/:story_id/chapters/:chapter_id/posts', authorise, (req, res, next) =>
		findChapterPosts(req.params.story_id, req.params.chapter_id)
			.then(posts => res.json(Result.ok(posts)))
			.catch(e => res.json(Result.OTHER(e)))
	)
	
	api.post('/stories/:story_id/chapters/:chapter_id/posts', authorise, (req, res, next) =>
		Promise.all([
			req.body.author && req.body.author !== req.bearer.user
				? Promise.reject(`You can't edit somebody else's posts.`)
				: Promise.resolve(makePost(req.body, req.bearer, req.params))
		])
		.then(([ x ]) => x)
		.then(validatePost)
		.then(savePost)
		.then(x => res.json(Result.ok(x)))
		.catch(e => res.json(Result.OTHER(e)))
	)

	api.get('/avatars/:username', (req, res, next) =>
		Promise.resolve(`${IMAGES_FOLDER}${req.params.username}.png`)
			.then(filepath => fs.existsSync(filepath)
				? filepath
				: `${IMAGES_FOLDER}default.png`)
			.then(filepath => res.sendFile(filepath))
	)

	return api
}