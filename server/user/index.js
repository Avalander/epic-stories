const {
	makeRegisterUser,
	makeFindUser,
	makeFindUserAvatar,
	makeFindUserPreferences,
	makeSaveUserPreferences,
} = require('./user.store')

const {
	makeSignIn,
} = require('./user.auth')

const {
	validateUserPreferences,
} = require('validators')

const makeUserApi = require('./user.api')

module.exports = ({ IMAGES_FOLDER, SECRET, Router, authorise, db }) => {
	const findUser = makeFindUser(db)
	return makeUserApi({
		Router,
		authorise,
		signIn: makeSignIn({ SECRET, findUser }),
		registerUser: makeRegisterUser(db),
		findUser,
		findUserAvatar: makeFindUserAvatar(IMAGES_FOLDER),
		findUserPreferences: makeFindUserPreferences(db),
		saveUserPreferences: makeSaveUserPreferences(db),
		validateUserPreferences,
	})
}
