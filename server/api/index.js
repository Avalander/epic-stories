const loginUser = (req, res) => ({ token, user }) =>
	res.cookie('bearer', token, { httpOnly: true })
		.json({ username: user.username, groups: user.groups })

module.exports = ({ Router, signIn, authorise, registerUser, createStory, findAllStories, findStory }) => {
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

	api.post('/ping', authorise, (req, res) => res.json({ message: 'pong' }))

	api.get('/stories', (req, res, next) => findAllStories(1)
		.then(stories => res.json(stories))
		.catch(next)
	)

	api.get('/stories/:id', (req, res, next) => findStory(req.params.id)
		.then(story => res.json(story))
		.catch(next)
	)

	api.post('/stories', (req, res, next) => {
		const { title, description, group } = req.body
		if (!title || !group) return next(new Error('Missing information.'))
		createStory({ title, description, group })
			.then(({ insertedId }) => res.json({ insertedId }))
			.catch(next)
	})

	return api
}