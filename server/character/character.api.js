const Future = require('fluture')
const { Result } = require('result')


module.exports = ({ Router, authorise, findCharacter, findStoryCharacters, saveCharacter, validateCharacter }) => {
	const api = Router()

	api.get('/stories/:story_id/characters', authorise, (req, res) =>
		findStoryCharacters(req.params.story_id)
			.fold(x => x, characters => Result.ok(characters))
			.value(result => res.json(result))
	)

	api.get('/stories/:story_id/my-character', authorise, (req, res) =>
		findCharacter(req.params.story_id, req.bearer.user)
			.fold(x => x, character => Result.ok(character))
			.value(result => res.json(result))
	)

	api.post('/stories/:story_id/my-character', authorise, (req, res) =>
		Future.of(Object.assign({}, req.body, { username: req.bearer.user}))
			.chain(validateCharacter)
			.chain(saveCharacter)
			.fold(x => x, y => Result.ok(y))
			.value(result => res.json(result))
	)

	return api
}
