const { Result, error_codes } = require('result')


const loginUser = (req, res) => ({ token, user }) =>
	res.cookie('bearer', token, { httpOnly: true })
		.json({ username: user.username, groups: user.groups })

module.exports = ({ Router, signIn, authorise, registerUser, createStory, findStoriesByGroups, findStory }) => {
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

	api.get('/stories/:id', (req, res, next) => findStory(req.params.id)
		.then(story => res.json(Result.ok(story)))
		.catch(next)
	)

	api.post('/stories', (req, res, next) => {
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