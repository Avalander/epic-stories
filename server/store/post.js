const ObjectId = require('mongodb').ObjectId


const makeSavePost = database => post => database()
	.then(db => Promise.all([
		Promise.resolve(db),
		Promise.resolve(Object.assign({}, post, (post._id ? { _id: ObjectId(post._id) } : {})))
	]))
	.then(([ db, post ]) => db.collection('posts').save(post))

const makeFindStoryPosts = database => story_id => database()
	.then(db => db.collection('posts')
		.find({ story_id })
		.sort({ created_on: 1 })
		.toArray()
	)

module.exports = {
	makeFindStoryPosts,
	makeSavePost,
}
