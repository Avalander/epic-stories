const jwt = require('jsonwebtoken')
const { Result } = require('result')


const TOKEN_DURATION = 10 * 60

const makeSignIn = ({ SECRET, findUser }) => (username, password) => findUser(username, password)
	.then(user => Promise.resolve({
		token: jwt.sign({ user: user.username, groups: user.groups }, SECRET, { expiresIn: TOKEN_DURATION }),
		user,
	}))

const makeAuthorise = ({ SECRET }) => (req, res, next) => {
	const { bearer } = req.cookies
	if (!bearer) {
		res.json(Result.INVALID_CREDENTIALS('Unauthorised.'))
		return next(new Error('Unauthorised.'))
	}
	jwt.verify(bearer, SECRET, (err, decoded) => {
		if (err) {
			res.json(Result.INVALID_CREDENTIALS(err.message || err))
			return next(err)
		}
		req.bearer = decoded
		next()
	})
}

module.exports = {
	makeSignIn,
	makeAuthorise,
}