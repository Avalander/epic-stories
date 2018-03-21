const mongo = require('mongodb')
require('dotenv').config()

const { DB_URL, DB_NAME } = process.env
const command = process.argv[2]
const params = process.argv.slice(3)

const openConnection = () => mongo.MongoClient.connect(DB_URL)
	.then(client => Promise.all([
		client.db(DB_NAME),
		Promise.resolve(client),
	]))

const show_users = () => openConnection()
	.then(([ db, client ]) => {
		db.collection('users').find({}).toArray()
			.then(users => {
				console.log(users)
				client.close()
			})
	})

const show = ([ name='users' ]) => openConnection()
	.then(([ db, client ]) => Promise.all([
		db.collection(name).find({}).toArray(),
		Promise.resolve(client),
	]))
	.then(([ items, client ]) => {
		console.log(items)
		client.close()
	})

const create_token = ([ token='asdasaf', ...groups ]) => openConnection()
	.then(([ db, client ]) => Promise.all([
		Promise.resolve(client),
		db.collection('invites').insertOne({ token, groups: groups.length > 0 ? groups : [ '1' ]}),
	]))
	.then(([ client ]) => {
		console.log(`Created token '${token}'.`)
		client.close()
	})

const reset = () => openConnection()
	.then(([ db, client ]) => Promise.all([
		Promise.resolve(client),
		db.collection('users').deleteMany({}),
		db.collection('invites').deleteMany({}),
	]))
	.then(([ client ]) => {
		console.log(`Cleared database.`)
		client.close()
	})

const commands = {
	create_token,
	reset,
	show,
	show_users,
}

commands[command](params)