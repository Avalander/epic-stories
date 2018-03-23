const exists = obj => obj !== undefined && obj !== null


const required_keys = [
	'name',
	'story_id',
	'username',
]

const expected_keys = [
	...required_keys,
	'_id',
	'high_concept',
	'trouble',
	'description',
]

const isValid = character => {
	for (key of required_keys) {
		if (!exists(character[key])) return Promise.reject(`Missing key '${key}'.`)
	}
	for (key of Object.keys(character)) {
		if (!expected_keys.includes(key)) return Promise.reject(`Unexpected key '${key}'.`)
	}
	return Promise.resolve(character)
}

module.exports = isValid
