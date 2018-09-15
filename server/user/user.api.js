const Future = require('fluture')

const { Result } = require('result')


const loginUser = (req, res) => ({ token, user }) =>
	res.cookie('bearer', token, { httpOnly: true })
		.json({ username: user.username, groups: user.groups })

module.exports = ({ Router, authorise, signIn, registerUser, findUser, findUserAvatar, findUserPreferences, saveUserPreferences, validateUserPreferences }) => {
	const api = Router()

	api.post('/register/:token', (req, res, next) => {
		const { token } = req.params
		const { username, password } = req.body
		if (!username || !password || !token) return next(new Error('Invalid request.'))
		registerUser(username, password, token)
			.chain(() => signIn(username, password))
			.fork(next, loginUser(req, res))
	})

	api.post('/login', (req, res, next) => {
		const { username, password } = req.body
		if (!password) return next(new Error('User not found.'))
		signIn(username, password)
			.fork(next, loginUser(req, res))
	})

	api.get('/user', authorise, (req, res) =>
		findUserPreferences(req.bearer.user)
			.map(x =>
				({
					...x,
					username: req.bearer.user,
					groups: req.bearer.groups,
				})
			)
			.fold(
				x => x,
				y => Result.ok(y)
			)
			.value(x => res.json(x))
	)

	api.get('/user/preferences', authorise, (req, res) =>
		findUserPreferences(req.bearer.user)
			.fold(x => x, y => Result.ok(y))
			.value(x => res.json(x))
	)

	api.post('/user/preferences', authorise, (req, res) =>
		validateUserPreferences(Object.assign({}, req.body, { username: req.bearer.user }))
			.chain(saveUserPreferences)
			.fold(x => x, y => Result.ok(y))
			.value(x => res.json(x))
	)
	
	api.get('/avatars/:username', (req, res) =>
		res.sendFile(findUserAvatar(req.params.username))
	)

	return api
}
