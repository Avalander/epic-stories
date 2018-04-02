const path = require('path')

const express = require('express')
const { Router } = express
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fallback = require('express-history-api-fallback')

const makeDatabase = require('store/database')
const { makeFindUser, makeRegisterUser } = require('store/user')
const {
	makeCreateStory,
	makeFindStoriesByGroups,
	makeFindStory,
	makeSaveChapter,
} = require('store/story')
const {
	makeFindStoryCharacters,
	makeFindUserCharacters,
	makeFindCharacter,
	makeSaveCharacter,
} = require('store/character')
const {
	makeFindLatestStoryPost,
	makeFindStoryPosts,
	makeFindChapterPosts,
	makeSavePost,
} = require('store/post')

const makeApi = require('api')
const { makeSignIn, makeAuthorise } = require('api/auth')

const makeStoryApi = require('story')

const errorHandler = require('error-handler')

require('dotenv').config()

const { SECRET, DB_URL, DB_NAME, PORT } = process.env

const database = makeDatabase({ DB_URL, DB_NAME })
const findUser = makeFindUser(database)
const registerUser = makeRegisterUser(database)
const createStory = makeCreateStory(database)
const findStoriesByGroups = makeFindStoriesByGroups(database)
const findStory = makeFindStory(database)
const saveChapter = makeSaveChapter(database)
const findStoryCharacters = makeFindStoryCharacters(database)
const findUserCharacters = makeFindUserCharacters(database)
const findCharacter = makeFindCharacter(database)
const saveCharacter = makeSaveCharacter(database)
const findLatestStoryPost = makeFindLatestStoryPost(database)
const findStoryPosts = makeFindStoryPosts(database)
const findChapterPosts = makeFindChapterPosts(database)
const savePost = makeSavePost(database)

const signIn = makeSignIn({ SECRET, findUser })
const authorise = makeAuthorise({ SECRET })

const app = express()

app.disable('x-powered-by')
app.use(cookieParser())
app.use(bodyParser.json())

app.use('/api', makeApi({
	Router: express.Router, signIn, authorise, registerUser, createStory, findStoriesByGroups, findStory,
	findStoryCharacters, findUserCharacters, findCharacter, saveCharacter, findStoryPosts, savePost, findLatestStoryPost,
	saveChapter, findChapterPosts,
}))

app.use('/api', makeStoryApi({ Router, authorise, database }))

const static_root = path.join(__dirname, '..', 'static')
app.use(express.static(static_root, { extensions: [ 'html' ]}))
app.use(fallback('index.html', { root: static_root }))

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server started listening on port ${PORT}.`))

const exitHandler = () => database.close()
	.then(() => {
		console.log('Bye.')
		process.exit()
	})

process.on('exit', exitHandler)
process.on('SIGINT', exitHandler)
process.on('SIGTERM', exitHandler)
