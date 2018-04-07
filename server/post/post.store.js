const Future = require('fluture')
const { ObjectId } = require('mongodb')


module.exports.makeFindStoryPosts = db => (story_id, chapter_id) =>
	Future.node(done =>
		db.collection('posts')
			.find({ story_id, chapter_id })
			.sort({ created_on: 1 })
			.toArray(done)
	)

module.exports.makeSavePost = db => post =>
	Future.node(done =>
		db.collection('posts').save(parsePost(post), null, done)
	)

const parsePost = post => Object.assign(
	{},
	post,
	post._id ? { _id: ObjectId(post._id) } : {}
)
