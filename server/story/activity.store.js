const { node } = require('fluture')


module.exports.makeGetLastView = db => (username, story_id) =>
	node(
		done =>
			db.collection('user-activity')
				.find({
					username,
					action: 'view-story',
					'data.story_id': story_id,
				})
				.toArray(done)
	)
	.map(reduceLastViewActivity)


const reduceLastViewActivity = events =>
	events.reduce(
		reduceLastViewEvent,
		{}
	)

const reduceLastViewEvent = (prev, { data, timestamp }) =>
	(prev[data.chapter_id] && prev[data.chapter_id].timestamp > timestamp
		? prev
		: Object.assign(
			prev,
			{
				[data.chapter_id]: makeLastViewEntry(data, timestamp),
			}
		)
	)

const makeLastViewEntry = (data, timestamp) =>
	Object.assign(
		{ timestamp },
		data,
	)
