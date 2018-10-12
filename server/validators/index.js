const Future = require('fluture')

const { Result } = require('result')


const exists = obj => obj !== undefined && obj !== null

const hasContent = value => exists(value) && (typeof value === 'string' ? value.length > 0 : true)

const makeValidator = (required_keys, optional_keys) => obj => {
	const expected_keys = [ ...required_keys, ...optional_keys ]
	for (let key of required_keys) {
		if (!hasContent(obj[key])) return Future.reject(Result.INVALID_DATA(`Missing key '${key}'.`))
	}
	for (let key of Object.keys(obj)) {
		if (!expected_keys.includes(key)) return Future.reject(Result.INVALID_DATA(`Unexpected key '${key}'.`))
	}
	return Future.of(obj)
}

module.exports.validateCharacter = makeValidator(
	[ 'name', 'story_id', 'username' ],
	[ '_id', 'high_concept', 'trouble', 'description']
)

module.exports.validatePost = makeValidator(
	[ 'text', 'story_id', 'author', 'created_on' ],
	[ '_id', 'type', 'edited_on', 'chapter_id' ]
)

module.exports.validateStory = makeValidator(
	[ 'title', 'group' ],
	[ '_id', 'description', 'chapters' ]
)

module.exports.validateChapter = makeValidator(
	[ 'title' ],
	[ 'id' ]
)

module.exports.validateUserPreferences = makeValidator(
	[ 'username' ],
	[ '_id', 'display_name' ]
)

module.exports.validateActivity = makeValidator(
	[ 'username', 'action', 'timestamp' ],
	[ 'data' ]
)
