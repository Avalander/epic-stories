const {
	validateChapter,
	validateStory,
} = require('validators')

const {
	makeCreateStory,
	makeFindStoriesByGroups,
	makeFindStory,
	makeSaveChapter,
} = require('./story.store')

const {
	makeFindUserCharacters,
} = require('./character.store')

const {
	makeFindLatestStoryPost,
} = require('./post.store')

const makeStoryApi = require('./story.api')


module.exports = ({ Router, authorise, db }) => makeStoryApi({
	Router,
	authorise,
	validateStory,
	validateChapter,
	createStory: makeCreateStory(db),
	findStoriesByGroups: makeFindStoriesByGroups(db),
	findStory: makeFindStory(db),
	saveChapter: makeSaveChapter(db),
	findUserCharacters: makeFindUserCharacters(db),
	findLatestStoryPost: makeFindLatestStoryPost(db),
})