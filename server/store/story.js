const ObjectId = require('mongodb').ObjectId

const fail = message => {
	throw new Error(message)
}

const makeFindStoriesByGroups = database => groups => database()
	.then(db => db.collection('stories').find({ group: { $in: groups }}).toArray())

const makeFindStory = database => id => database()
	.then(db => db.collection('stories').findOne({ _id: ObjectId(id) }))
	.then(story => story
		? story
		: fail(`Story '${id}' not found.`))

const makeCreateStory = database => story => database()
	.then(db => db.collection('stories').insertOne(story))

module.exports = {
	makeCreateStory,
	makeFindStoriesByGroups,
	makeFindStory,
}