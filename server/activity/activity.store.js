const { node } = require('fluture')


module.exports.makeSaveActivity = db => activity =>
	node(
		done =>
			db.collection('user-activity')
				.insertOne(activity, null, done)
	)
