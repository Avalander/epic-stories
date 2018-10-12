const { node } = require('fluture')


module.exports.makeSaveActivity = db => activity =>
	node(
		done =>
			db.collection('user-activity')
				.insertOne(activity, null, done)
	)

module.exports.makeFindActivity = db => (username, action, story_id) =>
	node(
		done =>
			db.collection('user-activity')
				.find({
					username,
					action,
					'data.story_id': story_id,
				}, done)
	)
