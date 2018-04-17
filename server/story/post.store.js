const Future = require('fluture')


module.exports.makeFindLatestStoryPost = db => story_id =>
	Future.node(done =>
		db.collection('posts')
			.find({ story_id })
			.sort({ created_on: -1 })
			.limit(1)
			.toArray(done)
	)
	.map(result => result[0] || {})

module.exports.makeFindLatestChapterPost = db => (story_id, chapter_id) =>
	Future.node(done =>
		db.collection('posts')
			.find({ story_id, chapter_id })
			.sort({ created_on: -1 })
			.limit(1)
			.toArray(done)
	)
	.map(result => result[0] || {})