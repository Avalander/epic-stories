const fs = require('fs')

const { Result, error_codes } = require('result')

const {
	validateCharacter,
	validateChapter,
	validatePost,
	validateStory,
} = require('validators')


const loginUser = (req, res) => ({ token, user }) =>
	res.cookie('bearer', token, { httpOnly: true })
		.json({ username: user.username, groups: user.groups })

const makePost = (payload, { user }, { story_id, chapter_id }) => Object.assign(
	{ created_on: Date.now() },
	payload,
	{ author: user, story_id, chapter_id },
	('_id' in payload ? { edited_on: Date.now() } : {}),
)

module.exports = ({ Router, authorise, findStoryCharacters, findCharacter, saveCharacter, findStoryPosts, savePost, findChapterPosts }) => {
	const api = Router()

	api.get('/stories/:story_id/posts', authorise, (req, res, next) => findStoryPosts(req.params.story_id)
		.then(posts => res.json(Result.ok(posts)))
		.catch(e => res.json(Result.OTHER(e)))
	)

	api.post('/stories/:story_id/posts', authorise, (req, res, next) =>
		Promise.all([
			req.body.author && req.body.author !== req.bearer.user
				? Promise.reject('You can\'t edit somebody else\'s posts.')
				: Promise.resolve(makePost(req.body, req.bearer, req.params))
		])
		.then(([ x ]) => x)
		.then(validatePost)
		.then(savePost)
		.then(x => res.json(Result.ok(x)))
		.catch(e => {
			console.error(e)
			res.json(Result.OTHER(e))
		})
	)

	api.get('/stories/:story_id/chapters/:chapter_id/posts', authorise, (req, res, next) =>
		findChapterPosts(req.params.story_id, req.params.chapter_id)
			.then(posts => res.json(Result.ok(posts)))
			.catch(e => res.json(Result.OTHER(e)))
	)
	
	api.post('/stories/:story_id/chapters/:chapter_id/posts', authorise, (req, res, next) =>
		Promise.all([
			req.body.author && req.body.author !== req.bearer.user
				? Promise.reject(`You can't edit somebody else's posts.`)
				: Promise.resolve(makePost(req.body, req.bearer, req.params))
		])
		.then(([ x ]) => x)
		.then(validatePost)
		.then(savePost)
		.then(x => res.json(Result.ok(x)))
		.catch(e => {
			console.error(e)
			res.json(Result.OTHER(e))
		})
	)

	return api
}