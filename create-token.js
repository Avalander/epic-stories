const mongo = require('mongodb')
require('dotenv').config()

const token = process.argv[2] || 'asdasaf'

mongo.MongoClient.connect(process.env.DB_URL)
	.then(client => Promise.all([client.db(process.env.DB_NAME), Promise.resolve(client)]))
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