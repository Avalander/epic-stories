const path = require('path')

const express = require('express')
const { Router } = express
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fallback = require('express-history-api-fallback')

const makeDatabase = require('store/database')
const {
	makeFindStoryCharacters,
	makeFindUserCharacters,
	makeFindCharacter,
	makeSaveCharacter,
} = require('store/character')
const {
	makeFindStoryPosts,
	makeFindChapterPosts,
	makeSavePost,
} = require('store/post')

const makeApi = require('api')
const { makeAuthorise } = require('api/auth')

const makeStoryApi = require('story')
const makeUserApi = require('user')

const errorHandler = require('error-handler')

require('dotenv').config()

const { SECRET, DB_URL, DB_NAME, PORT, IMAGES_FOLDER } = process.env

const database = makeDatabase({ DB_URL, DB_NAME })
const findStoryCharacters = makeFindStoryCharacters(database)
const findCharacter = makeFindCharacter(database)
const saveCharacter = makeSaveCharacter(database)
const findStoryPosts = makeFindStoryPosts(database)
const findChapterPosts = makeFindChapterPosts(database)
const savePost = makeSavePost(database)

const authorise = makeAuthorise({ SECRET })

const app = express()

app.disable('x-powered-by')
app.use(cookieParser())
app.use(bodyParser.json())

app.use('/api', makeApi({
	Router: express.Router, 
	authorise,
	findStoryCharacters,
	findCharacter,
	saveCharacter,
	findStoryPosts,
	savePost,
	findChapterPosts,
}))

console.log(`Connecting to database at ${DB_URL}...`)
database()
	.then(db => {
		app.use('/api', makeStoryApi({ Router, authorise, database, db }))
		app.use('/api', makeUserApi({ SECRET, IMAGES_FOLDER, Router, authorise, db }))

		const static_root = path.join(__dirname, '..', 'static')
		app.use(express.static(static_root, { extensions: [ 'html' ]}))
		app.use(fallback('index.html', { root: static_root }))

		app.use(errorHandler)

		app.listen(PORT, () => console.log(`Server started listening on port ${PORT}.`))
	})
	.catch(err => {
		console.error(err)
		process.exit(1)
	})

const exitHandler = () => database.close()
	.then(() => {
		console.log('Bye.')
		process.exit()
	})

process.on('exit', exitHandler)
process.on('SIGINT', exitHandler)
process.on('SIGTERM', exitHandler)
