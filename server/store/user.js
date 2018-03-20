const bcrypt = require('bcrypt')


const hashPassword = password => bcrypt.hash(password, 10)

const makeRegisterUser = database => (username, password, token) => database()
	.then(db => Promise.all([
		db.collection('invites').findOneAndDelete({ token })
			.then(({ value }) => value
				? Promise.resolve(value)
				: Promise.reject(new Error('Token not found.'))
			),
		hashPassword(password),
		Promise.resolve(db),
	]))
	.then(([invite, hash_password, db]) => {
		console.log(invite)
		return db.collection('users').insertOne({
			token: invite.token,
			groups: invite.groups,
			password: hash_password,
			username,
		})
	})

const makeFindUser = database => (username, password) => new Promise((resolve, reject) => {
	database()
		.then(db => db.collection('users').findOne({ username }))
		.then(user => Promise.all([ bcrypt.compare(password, user.password), Promise.resolve(user) ]))
		.then(([ result, user ]) => result
			? resolve(user)
			: reject(new Error('User not found.'))
		)
})

module.exports = {
	makeFindUser,
	makeRegisterUser,
}