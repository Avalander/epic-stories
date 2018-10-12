const { validateActivity } = require('validators')
const { makeSaveActivity } = require('./activity.store')
const { makeTrackActivity } = require('./activity.api')


module.exports = ({ Router, db, authorise }) => {
	const api = Router()
	const saveActivity = makeSaveActivity(db)
	const trackActivity = makeTrackActivity({
		validateActivity,
		saveActivity,
	})

	api.post('/activity', authorise, trackActivity)

	return api
}
