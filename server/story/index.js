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
} = require('store/character')

const {
	makeFindLatestStoryPost,
} = require('store/post')

const makeStoryApi = require('./story.api')


module.exports = ({ Router, authorise, database }) => makeStoryApi({
	Router,
	authorise,
	validateStory,
	validateChapter,
	createStory: makeCreateStory(database),
	findStoriesByGroups: makeFindStoriesByGroups(database),
	findStory: makeFindStory(database),
	saveChapter: makeSaveChapter(database),
	findUserCharacters: makeFindUserCharacters(database),
	findLatestStoryPost: makeFindLatestStoryPost(database),
})