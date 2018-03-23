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

const generateToken = value => {
	if (value) return Promise.resolve(value)
	const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
	const result = []
	for (let i=0; i<64; i++) {
		const index = Math.floor(Math.random() * chars.length)
		result.push(chars[index])
	}
	return Promise.resolve(result.join(''))
}

const show = ([ name='users' ]) => openConnection()
	.then(([ db, client ]) => Promise.all([
		db.collection(name).find({}).toArray(),
		Promise.resolve(client),
	]))
	.then(([ items, client ]) => {
		console.log(items)
		client.close()
	})

const create_token = ([ token, ...groups ]) => Promise.all([
		openConnection(),
		generateToken(token),
	])
	.then(([[ db, client ], token ]) => Promise.all([
		Promise.resolve(client),
		Promise.resolve(token),
		db.collection('invites').insertOne({ token, groups: groups.length > 0 ? groups : [ '1' ]}),
	]))
	.then(([ client, token ]) => {
		console.log(`Created token '${token}'.`)
		client.close()
	})

const reset = (names) => openConnection()
	.then(([ db, client ]) => Promise.all([
		Promise.resolve(client),
		...names.map(x => db.collection(x).deleteMany({})),
	]))
	.then(([ client ]) => {
		console.log(`Cleared collections [${names}].`)
		client.close()
	})

const commands = {
	create_token,
	reset,
	show,
}

commands[command](params)