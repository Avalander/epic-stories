const makeSavePost = database => post => database()
	.then(db => db.collection('posts').save(post))

const makeFindStoryPosts = database => story_id => database()
	.then(db => db.collection('posts').find({ story_id }).toArray())

module.exports = {
	makeFindStoryPosts,
	makeSavePost,
}
