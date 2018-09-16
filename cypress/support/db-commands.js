import mongo from 'mongodb'


Cypress.Commands.add('$db', () => {
	const db_url = Cypress.config('$dbUrl')
	const db_name = Cypress.config('$dbName')
	return mongo.MongoClient.connect(db_url/*, { useNewUrlParser: true }*/)
		.then(client =>
			Promise.all([
				client.db(db_name),
				client
			])
		)
		.then(([ db, client ]) => {
			db.close = () => client.close()
			return db
		})
})

Cypress.Commands.add('$close', { prevSubject: true }, (subject) => {
	subject.close()
})

Cypress.Commands.add('createToken', { prevSubject: true }, (db) => {
	const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
	const result = []
	while (result.length < 16) {
		const index = Math.floor(Math.random() * chars.length)
		result.push(chars[index])
	}
	const token = result.join('')
	return db.collection('invites')
		.insertOne({ token, groups: ['1'] })
		.then(() => token)
})

/*
const show = ([name = 'users']) => openConnection()
	.then(([db, client]) => Promise.all([
		db.collection(name).find({}).toArray(),
		Promise.resolve(client),
	]))
	.then(([items, client]) => {
		console.log(JSON.stringify(items, null, 4))
		client.close()
	})

const create_token = ([token, ...groups]) => Promise.all([
	openConnection(),
	generateToken(token),
])
	.then(([[db, client], token]) => Promise.all([
		Promise.resolve(client),
		Promise.resolve(token),
		db.collection('invites').insertOne({ token, groups: groups.length > 0 ? groups : ['1'] }),
	]))
	.then(([client, token]) => {
		console.log(`Created token '${token}'.`)
		client.close()
	})

const reset = (names) => openConnection()
	.then(([db, client]) => Promise.all([
		Promise.resolve(client),
		...names.map(x => db.collection(x).deleteMany({})),
	]))
	.then(([client]) => {
		console.log(`Cleared collections [${names}].`)
		client.close()
	})

const remove = ([collection, id]) => openConnection()
	.then(([db, client]) => Promise.all([
		Promise.resolve(client),
		db.collection(collection).findOneAndDelete({ _id: ObjectId(id) })
	]))
	.then(([client, removed]) => {
		console.log(`Removed element ${id} from ${collection}`)
		client.close()
	})

const commands = {
	create_token,
	remove,
	reset,
	show,
}

commands[command](params)
*/