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

module.exports.makeFindDisplayNames = db => () =>
	Future.node(done =>	
		db.collection('user-preferences')
			.find({})
			.toArray(done)
	)
	.map(result =>
		result.reduce((prev, { username, display_name }) =>
			Object.assign({}, prev, {
				[username]: display_name || username,
			}), {})
	)

const parsePost = post => Object.assign(
	{},
	post,
	post._id ? { _id: ObjectId(post._id) } : {}
)

const getDisplayName = (user_preferences, username) => {
	const preferences = user_preferences.find(x => x.username === username) || {}
	return preferences.display_name || username
}
