const mongo = require('mongodb')
require('dotenv').config()

const { DB_URL, DB_NAME } = process.env
const command = process.argv[2]
const value = process.argv[3]

const show_users = () => mongo.MongoClient.connect(DB_URL)
	.then(client => Promise.all([ client.db(DB_NAME), Promise.resolve(client) ]))
	.then(([ db, client ]) => {
		db.collection('users').find({}).toArray()
			.then(users => {
				console.log(users)
				client.close()
			})
	})

const create_token = (token='asdasaf') => mongo.MongoClient.connect(DB_URL)
	.then(client => Promise.all([client.db(DB_NAME), Promise.resolve(client)]))
	.then(([ db, client ]) => {
		Promise.all([
			db.collection('users').deleteMany({}),
			db.collection('invites').deleteMany({}),
		])
		.then(() => {
			return db.collection('invites').insertOne({
				token, groups: [ 1 ]
			})
		})
		.then(() => {
			console.log(`Created token ${token}.`)
			client.close()
		})
	})

const commands = {
	create_token,
	show_users,
}

commands[command](value)