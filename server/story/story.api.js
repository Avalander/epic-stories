const { Result, error_codes } = require('result')


module.exports = ({ Router, authorise, createStory, findStoriesByGroups, findStory, saveChapter, validateStory, validateChapter, findUserCharacters, findLatestStoryPost }) => {
	const api = Router()

	api.get('/stories', authorise, (req, res, next) =>
		Promise.all([
			findStoriesByGroups(req.bearer.groups),
			findUserCharacters(req.bearer.user),
		])
		.then(([ stories, characters ]) => stories.map(s => Object.assign(s, {
			is_playing: characters.some(c => c.story_id == s._id)
		})))
		.then(stories => Promise.all(
			stories.map(x => findLatestStoryPost(x._id.toString())
				.then(({ author, created_on }) => Object.assign({}, x, { _latest: { author, created_on }}))
			)
		))
		.then(stories => res.json(Result.ok(stories)))
		.catch(e => res.json(Result.OTHER(e)))
	)

	api.post('/stories', authorise, (req, res, next) =>
		Promise.resolve(Object.assign({}, req.body, { group: req.bearer.groups[0]}))
			.then(validateStory)
			.then(createStory)
			.then(({ insertedId }) => res.json(Result.ok({ insertedId })))
			.catch(e => res.json(Result.OTHER(e)))
	)

	api.get('/stories/:id', authorise, (req, res, next) => findStory(req.params.id)
		.then(story => res.json(Result.ok(story)))
		.catch(next)
	)

	api.post('/stories/:story_id/chapters', authorise, (req, res, next) =>
		Promise.all([
			req.params.story_id,
			validateChapter(req.body),
		])
		.then(([ story_id, chapter ]) => saveChapter(story_id, chapter))
		.then(x => res.json(Result.ok(x)))
		.catch(e => res.json(Result.OTHER(e)))
	)

	return api
}