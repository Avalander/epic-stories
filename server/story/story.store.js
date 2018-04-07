const Future = require('fluture')
const ObjectId = require('mongodb').ObjectId

const { Result } = require('result')


const internalError = error => {
	console.error(error)
	return Result.INTERNAL_ERROR(error.message)
}

const exists = value =>
	Future((reject, resolve) =>
		(value !== undefined && value !== null)
			? resolve(value)
			: reject())


const makeFindStoriesByGroups = db => groups =>
	Future.node(done =>
		db.collection('stories').find({ group: { $in: groups }}).toArray(done)
	)
	.mapRej(internalError)

const makeFindStory = db => id =>
	Future.node(done =>
		db.collection('stories').findOne({ _id: ObjectId(id) }, done)
	)
	.mapRej(internalError)
	.chain(exists)
	.mapRej(err => Result.NOT_FOUND(`Story '${id}' not found.`))

const makeCreateStory = db => story =>
	Future.node(done =>
		db.collection('stories').insertOne(story, null, done)
	)
	.mapRej(internalError)


const makeSaveChapter = db => (id, chapter) =>
	Future.node(done =>
		db.collection('stories').findOne({ _id: ObjectId(id) }, done)
	)
	.mapRej(internalError)
	.chain(exists)
	.mapRej(err => Result.NOT_FOUND(`Story '${id}' not found.`))
	.chain(story => Future.node(done =>
		db.collection('stories').save(concatChapter(story, chapter), null, done)
	))

const concatChapter = (story, { title }) => {
	const chapters = story.chapters || []
	return Object.assign({}, story, {
		chapters: [ ...chapters, { title, id: chapters.length + 1 }]
	})
}
/*
const concatChapter = (story, chapter) => ({
	...story,
	chapters: [
		...(story.chapters || []),
		{ ...chapter, id: (story.chapters || []).length + 1 }
	]
})
*/

module.exports = {
	makeCreateStory,
	makeFindStoriesByGroups,
	makeFindStory,
	makeSaveChapter,
}