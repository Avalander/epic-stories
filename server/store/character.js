const ObjectId = require('mongodb').ObjectId


const makeFindStoryCharacters = database => story_id => database()
	.then(db => db.collection('characters').find({ story_id }).toArray())

const makeFindCharacter = database => (story_id, username) => database()
	.then(db => db.collection('characters').findOne({ story_id, username }))

const makeFindUserCharacters = database => (username) => database()
	.then(db => db.collection('characters').find({ username }).toArray())

const makeSaveCharacter = database => character => database()
	.then(db => db.collection('characters').save(Object.assign({}, character, character._id ? { _id: ObjectId(character._id) } : {})))

module.exports = {
	makeFindCharacter,
	makeFindStoryCharacters,
	makeFindUserCharacters,
	makeSaveCharacter,
}
