const exists = obj => obj !== undefined && obj !== null

const hasContent = value => exists(value) && (typeof value === 'string' ? value.length > 0 : true)

const makeValidator = (required_keys, optional_keys) => obj => {
	const expected_keys = [ ...required_keys, ...optional_keys ]
	for (key of required_keys) {
		if (!hasContent(obj[key])) return Promise.reject(`Missing key '${key}'.`)
	}
	for (key of Object.keys(obj)) {
		if (!expected_keys.includes(key)) return Promise.reject(`Unexpected key '${key}'.`)
	}
	return Promise.resolve(obj)
}

module.exports.validateCharacter = makeValidator(
	[ 'name', 'story_id', 'username' ],
	[ '_id', 'high_concept', 'trouble', 'description']
)

module.exports.validatePost = makeValidator(
	[ 'text', 'story_id', 'author', 'created_on' ],
	[ '_id', 'type', 'edited_on', 'chapter' ]
)

module.exports.validateStory = makeValidator(
	[ 'title', 'group' ],
	[ '_id', 'description', 'chapters' ]
)

module.exports.validateChapter = makeValidator(
	[ 'title' ],
	[ 'id' ]
)
