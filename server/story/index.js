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


module.exports = ({ Router, authorise, database, db }) => makeStoryApi({
	Router,
	authorise,
	validateStory,
	validateChapter,
	createStory: makeCreateStory(db),
	findStoriesByGroups: makeFindStoriesByGroups(db),
	findStory: makeFindStory(db),
	saveChapter: makeSaveChapter(db),
	findUserCharacters: makeFindUserCharacters(database),
	findLatestStoryPost: makeFindLatestStoryPost(database),
})