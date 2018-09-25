import { article, div, h4, i, span, section } from '@hyperapp/html'
import { action } from '@hyperapp/fx'

import { fetchJson } from 'App/fx'
import { Notifications, Markdown } from 'App/components'


// State
const state = {
	characters: [],
	alerts: [],
}


// Actions
const actions = {
	onApiError: ({ error }) => state =>
		({
			...state,
			alerts: [
				...state.alerts,
				{ message: error.message, type: 'error' }
			],
		}),
	// Init
	clearState: () =>
		({
			characters: [],
			alerts: [],
		}),
	onCreate: story_id => [
		action('clearState'),
		action('fetchCharacters', story_id),
	],
	// Fetch Characters
	fetchCharacters: story_id =>
		fetchJson(
			`/api/stories/${story_id}/characters`,
			'onFetchCharactersSuccess',
			'onApiError'
		),
	onFetchCharactersSuccess: ({ result }) => state =>
		({
			...state,
			characters: result,
			alerts: [],
		}),
	// View Utils
	setCharacterExpand: ([ id, value ]) => state =>
		({
			...state,
			characters: setCharacterExpand(id, value, state.characters),
		}),
}

const setCharacterExpand = (id, value, characters) => {
	const character = characters.find(({ _id }) => _id === id)
	character._expand = value
	return characters
}


// View

const view = (state, actions, matcher) =>
	article({
		key: 'story-characters',
		oncreate: () => {
			actions.story.setActive('characters')
			actions.story.characters.onCreate(matcher.params.story_id)
		},
		ondestroy: () => actions.story.characters.clearState(),
	}, [
		Notifications(state.story.characters.alerts),
		article(
			state.story.characters.characters.map(
				x => Character(x, actions.story.characters)
			)
		),
	])

const Character = ({ name, username, high_concept, trouble, description='', _id, _expand }, { setCharacterExpand }) =>
	article({ class: 'character-panel' }, [
		CharacterHeader({ _id, name, _expand, setCharacterExpand }),
		CharacterBody({ username, high_concept, trouble, description, _expand }),
	])

const CharacterHeader = ({ name, _id, _expand, setCharacterExpand }) =>
	section({
		class: 'character-header pointer',
		onclick: () => setCharacterExpand([ _id, !_expand ]),
	}, [
		h4(name),
		i({ class: `fa tap-icon ${_expand ? 'fa-caret-up' : 'fa-caret-down'}` }),
	])

const CharacterBody = ({ username, high_concept, trouble, description, _expand }) =>
	section({ class: `character-body${_expand ? '' : ' hide'}` }, [
		Field('Player', username),
		Field('Character Concept', high_concept),
		Field('Trouble', trouble),
		div({ class: 'field' }, [
			span({ class: 'field-title' }, 'Description'),
			Markdown(description),
		]),
	])

const Field = (title, value) =>
	div({ class: 'field' }, [
		span({ class: 'field-title' }, title),
		span({ class: 'text' }, value),
	])


// Export
export default {
	state,
	actions,
	view,
}
