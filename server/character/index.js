const {
	validateCharacter
} = require('validators')

const {
	makeFindCharacter,
	makeFindStoryCharacters,
	makeSaveCharacter,
} = require('./character.store')

const makeCharacterApi = require('./character.api')


module.exports = ({ Router, db, authorise }) => makeCharacterApi({
	Router,
	authorise,
	findCharacter: makeFindCharacter(db),
	findStoryCharacters: makeFindStoryCharacters(db),
	saveCharacter: makeSaveCharacter(db),
	validateCharacter,
})
