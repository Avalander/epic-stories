const { validateActivity } = require('validators')

const {
	makeFindActivity,
	makeSaveActivity,
} = require('./activity.store')

const {
	makeGetLastView,
	makeTrackActivity,
} = require('./activity.api')


module.exports = ({ Router, db, authorise }) => {
	const api = Router()

	const findActivity = makeFindActivity(db)
	const saveActivity = makeSaveActivity(db)

	const trackActivity = makeTrackActivity({
		validateActivity,
		saveActivity,
	})
	const getLastView = makeGetLastView({ findActivity })

	api.post('/activity', authorise, trackActivity)

	api.get('/activity/:story_id', authorise, getLastView)

	return api
}
