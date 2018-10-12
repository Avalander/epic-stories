const { of } = require('fluture')
const { Result } = require('result')


module.exports.makeTrackActivity = ({ validateActivity, saveActivity }) => (req, res) =>
	of(Object.assign({ username: req.bearer.user }, req.body))
		.chain(validateActivity)
		.chain(saveActivity)
		.fold(
			x => x,
			y => Result.ok(y)
		)
		.value(x => res.json(x))

module.exports.makeGetLastView = ({ findActivity }) => (req, res) =>
	findActivity(req.bearer.user, 'view-story', req.params.story_id)
		.map(reduceLastViewActivity)
		.fold(
			x => x,
			y => Result.ok(y)
		)
		.value(x => res.json(x))


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
