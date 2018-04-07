const path = require('path')

const express = require('express')
const { Router } = express
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fallback = require('express-history-api-fallback')

const makeDatabase = require('database')

const { makeAuthorise } = require('api/auth')

const makeUserApi = require('user')
const makeStoryApi = require('story')
const makeCharacterApi = require('character')
const makePostApi = require('post')

const errorHandler = require('error-handler')

require('dotenv').config()


const { SECRET, DB_URL, DB_NAME, PORT, IMAGES_FOLDER } = process.env

const database = makeDatabase({ DB_URL, DB_NAME })
const authorise = makeAuthorise({ SECRET })

const app = express()

app.disable('x-powered-by')
app.use(cookieParser())
app.use(bodyParser.json())

console.log(`Connecting to database at ${DB_URL}...`)
database()
	.then(db => {
		app.use('/api', makeStoryApi({ Router, authorise, db }))
		app.use('/api', makeUserApi({ SECRET, IMAGES_FOLDER, Router, authorise, db }))
		app.use('/api', makeCharacterApi({ Router, authorise, db }))
		app.use('/api', makePostApi({ Router, authorise, db}))

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
