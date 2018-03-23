const { hasContent } = require('./util')


const required_keys = [
	'text',
	'story_id',
	'author',
	'created_on',
]

const expected_keys = [
	...required_keys,
	'_id',
	'type',
]

const isValid = obj => {
	for (key of required_keys) {
		if (!hasContent(obj[key])) return Promise.reject(`Missing key '${key}'.`)
	}
	for (key of Object.keys(obj)) {
		if (!expected_keys.includes(key)) return Promise.reject(`Unexpected key '${key}'.`)
	}
	return Promise.resolve(obj)
}

module.exports = isValid