const {
	validatePost,
} = require('validators')

const {
	makeFindStoryPosts,
	makeSavePost,
	makeFindDisplayNames,
} = require('./post.store')

const makePostApi = require('./post.api')


module.exports = ({ Router, db, authorise }) => makePostApi({
	Router,
	authorise,
	findStoryPosts: makeFindStoryPosts(db),
	findChapterPosts: makeFindStoryPosts(db),
	findDisplayNames: makeFindDisplayNames(db),
	savePost: makeSavePost(db),
	validatePost,
})