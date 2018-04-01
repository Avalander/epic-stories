const ObjectId = require('mongodb').ObjectId

const fail = message => {
	throw new Error(message)
}

const storyOrFail = id =>
	(story => story
		? story
		: fail(`Story '${id}' not found.`)
	)

const makeFindStoriesByGroups = database => groups => database()
	.then(db => db.collection('stories').find({ group: { $in: groups }}).toArray())

const makeFindStory = database => id => database()
	.then(db => db.collection('stories').findOne({ _id: ObjectId(id) }))
	.then(storyOrFail(id))

const makeCreateStory = database => story => database()
	.then(db => db.collection('stories').insertOne(story))

const makeSaveChapter = database => (id, chapter) => database()
	.then(db => Promise.all([
		db,
		db.collection('stories').findOne({ _id: ObjectId(id) }),
	]))
	.then(([db, story]) => Promise.all([
		db,
		storyOrFail(id)(story),
	]))
	.then(([ db, story ]) => db.collection('stories')
		.save(Object.assign({}, story, {
			chapters: [ ...(story.chapters || []), chapter ]
		}))
	)
	

module.exports = {
	makeCreateStory,
	makeFindStoriesByGroups,
	makeFindStory,
	makeSaveChapter,
}