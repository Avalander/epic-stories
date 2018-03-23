const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const makeDatabase = require('store/database')
const { makeFindUser, makeRegisterUser } = require('store/user')
const {
	makeCreateStory,
	makeFindStoriesByGroups,
	makeFindStory,
} = require('store/story')
const {
	makeFindStoryCharacters,
	makeFindUserCharacters,
	makeFindCharacter,
	makeSaveCharacter,
} = require('store/character')
const {
	makeFindStoryPosts,
	makeSavePost,
} = require('store/post')

const makeApi = require('api')
const { makeSignIn, makeAuthorise } = require('api/auth')

const errorHandler = require('error-handler')

require('dotenv').config()

const { SECRET, DB_URL, DB_NAME, PORT } = process.env

const database = makeDatabase({ DB_URL, DB_NAME })
const findUser = makeFindUser(database)
const registerUser = makeRegisterUser(database)
const createStory = makeCreateStory(database)
const findStoriesByGroups = makeFindStoriesByGroups(database)
const findStory = makeFindStory(database)
const findStoryCharacters = makeFindStoryCharacters(database)
const findUserCharacters = makeFindUserCharacters(database)
const findCharacter = makeFindCharacter(database)
const saveCharacter = makeSaveCharacter(database)
const findStoryPosts = makeFindStoryPosts(database)
const savePost = makeSavePost(database)

const signIn = makeSignIn({ SECRET, findUser })
const authorise = makeAuthorise({ SECRET })

const app = express()

app.disable('x-powered-by')
app.use(cookieParser())
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '..', 'static'), { extensions: [ 'html' ]}))

app.use('/api', makeApi({ Router: express.Router, signIn, authorise, registerUser, createStory, findStoriesByGroups, findStory, findStoryCharacters, findUserCharacters, findCharacter, saveCharacter, findStoryPosts, savePost }))

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
