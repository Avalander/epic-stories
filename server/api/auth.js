const jwt = require('jsonwebtoken')


const TOKEN_DURATION = 10 * 60

const makeSignIn = ({ SECRET, findUser }) => (username, password) => findUser(username, password)
	.then(user => Promise.resolve({
		token: jwt.sign({ user: user.username, iss: 'epic-stories' }, SECRET, { expiresIn: TOKEN_DURATION }),
		user,
	}))

const makeAuthorise = ({ SECRET }) => token => new Promise((resolve, reject) => {
	jwt.verify(token, SECRET, (err, decoded) => {
		if (err) reject(err)
		else resolve(decoded)
	})
})

module.exports = {
	makeSignIn,
	makeAuthorise,
}