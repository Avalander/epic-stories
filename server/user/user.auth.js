const jwt = require('jsonwebtoken')
const Future = require('fluture')


const TOKEN_DURATION = 5 * 60 * 60

module.exports.makeSignIn = ({ SECRET, findUser }) => (username, password) =>
	findUser(username, password)
		.map(user => ({
			token: jwt.sign({ user: user.username, groups: user.groups }, SECRET, { expiresIn: TOKEN_DURATION }),
			user,
		}))