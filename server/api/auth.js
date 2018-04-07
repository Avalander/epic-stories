const jwt = require('jsonwebtoken')

const { Result } = require('result')


module.exports.makeAuthorise = ({ SECRET }) => (req, res, next) => {
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
