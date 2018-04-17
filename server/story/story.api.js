const Future = require('fluture')

const { Result } = require('result')


module.exports = ({ Router, authorise, createStory, findStoriesByGroups, findStory, saveChapter, validateStory, validateChapter, findUserCharacters, findLatestStoryPost, findLatestChapterPost }) => {
	const api = Router()

	api.get('/stories', authorise, (req, res, next) =>
		Future.parallel(2, [
			findStoriesByGroups(req.bearer.groups),
			findUserCharacters(req.bearer.user),
		])
		.map(([ stories, characters ]) => stories.map(s => Object.assign(s, {
			is_playing: characters.some(c => c.story_id == s._id)
		})))
		.chain(stories => Future.parallel(Infinity,
			stories.map(x => findLatestStoryPost(x._id.toString())
				.map(({ author, created_on, chapter_id }) => Object.assign({}, x, { _latest: { author, created_on, chapter_id }})
			))
		))
		.fork(
			err => res.json(Result.OTHER(err)),
			stories => res.json(Result.ok(stories))
		)
	)

	api.post('/stories', authorise, (req, res, next) =>
		Future.of(Object.assign({}, req.body, { group: req.bearer.groups[0]}))
			.chain(validateStory)
			.chain(createStory)
			.fold(x => x, ({ insertedId }) => Result.ok({ insertedId }))
			.value(x => res.json(x))
	)

	api.get('/stories/:id', authorise, (req, res, next) =>
		findStory(req.params.id)
			.chain(story =>
				Future.parallel(Infinity, [
					Future.of(story),
					...(story.chapters || []).map(
						x => findLatestChapterPost(story._id.toString(), x.id.toString())
					)
				])
			)
			.map(([ story, ...latest_posts ]) =>
				Object.assign({}, story, {
					chapters: (story.chapters || []).map(
						x => Object.assign({}, x, {
							_latest: latest_posts.find(y => y.chapter_id == x.id)
						})
					)
				})
			)
			.fold(x => x, story => Result.ok(story))
			.value(x => res.json(x))
	)

	api.post('/stories/:story_id/chapters', authorise, (req, res, next) =>
		validateChapter(req.body)
			.chain(chapter => saveChapter(req.params.story_id, chapter))
			.fold(x => x, result => Result.ok(result))
			.value(x => res.json(x))
	)

	return api
}