const fs = require('fs')

const bcrypt = require('bcrypt')
const Future = require('fluture')


const hashPassword = password => Future.tryP(() => bcrypt.hash(password, 10))
const comparePassword = (password, hash) => Future.tryP(() => bcrypt.compare(password, hash))

module.exports.makeRegisterUser = db => (username, password, token) =>
	Future.node(done => db.collection('users').findOne({ username }, done))
		.chain(user => user
			? Future.reject(new Error('Username already exists.'))
			: Future.of(user))
		.chain(() => Future.node(done =>
			db.collection('invites').findOneAndDelete({ token }, done)
		))
		.chain(({ value }) => Future.both(
			value
				? Future.of(value)
				: Future.reject(new Error('Invalid token.')),
			hashPassword(password),
		))
		.chain(([ invite, hash_password ]) =>
			Future.node(done => db.collection('users').insertOne({
				token: invite.token,
				groups: invite.groups,
				password: hash_password,
				username
			}, null, done)
		))

module.exports.makeFindUser = db => (username, password) =>
	Future.node(done => db.collection('users').findOne({ username }, done))
		.chain(user => user && bcrypt.compareSync(password, user.password)
			? Future.of(user)
			: Future.reject(new Error('User not found.')))

module.exports.makeFindUserAvatar = IMAGES_FOLDER => username => {
	const filepath = `${IMAGES_FOLDER}${username}.png`
	return fs.existsSync(filepath) ? filepath : `${IMAGES_FOLDER}default.png`
}
