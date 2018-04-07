const Future = require('fluture')


module.exports.makeFindUserCharacters = db => username =>
	Future.node(done =>
		db.collection('characters')
			.find({ username })
			.toArray(done)
	)
