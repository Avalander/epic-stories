const loginUser = res => ({ token, user }) =>
	res.cookie('bearer', token, { httpOnly: true })
		.json({ username: user.username, groups: user.groups })

module.exports = ({ Router, signIn, authorise, registerUser }) => {
	const api = Router()

	api.post('/register/:token', (req, res, next) => {
		const { token } = req.params
		const { username, password } = req.body
		if (!username || !password || !token) return next(new Error('Invalid request.'))
		registerUser(username, password, token)
			.then(() => signIn(username, password))
			.then(loginUser(res))
			.catch(next)
	})

	api.post('/login', (req, res, next) => {
		const { username, password } = req.body
		if (!password) return next(new Error('User not found.'))
		signIn(username, password)
			.then(loginUser(res))
			.catch(next)
	})

	return api
}