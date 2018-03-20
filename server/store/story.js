const ObjectId = require('mongodb').ObjectId

const fail = message => {
	throw new Error(message)
}

const makeFindAllStories = database => group => database()
	.then(db => db.collection('stories').find({ group }).toArray())

const makeFindStory = database => id => database()
	.then(db => Promise.all([
		Promise.resolve(db),
		db.collection('stories').findOne({ _id: ObjectId(id) }),
	]))
	.then(([ db, story ]) => story
		? Promise.all([
			Promise.resolve(story),
			db.collection('messages').find({ story: story._id }).toArray(),
		])
		: fail(`Story '${id}' not found.`)
	)
	.then(([ story, messages ]) => ({ story, messages }))

const makeCreateStory = database => story => database()
	.then(db => db.collection('stories').insertOne(story))

module.exports = {
	makeCreateStory,
	makeFindAllStories,
	makeFindStory,
}