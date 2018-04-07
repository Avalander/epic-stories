const Future = require('fluture')
const ObjectId = require('mongodb').ObjectId


module.exports.makeFindStoryCharacters = db => story_id =>
	Future.node(done => db.collection('characters').find({ story_id }).toArray(done))

module.exports.makeFindCharacter = db => (story_id, username) =>
	Future.node(done => db.collection('characters').findOne({ story_id, username }, done))

module.exports.makeSaveCharacter = db => character =>
	Future.node(done =>
		db.collection('characters').save(parseCharacter(character), null, done)
	)

const parseCharacter = character => Object.assign({},
	character,
	character._id
		? { _id: ObjectId(character._id)}
		: {})
