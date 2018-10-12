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
