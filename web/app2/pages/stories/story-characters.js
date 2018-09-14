import { article, div, h4, i, span, section } from '@hyperapp/html'
import { action } from '@hyperapp/fx'

import { fetchJson } from 'App/fx'
import { Notifications, Markdown } from 'App/components'

import StoryHeader from './_story-header'
import makeFetchStory from './_story-fetch'


// State
const state = {
	story: {},
	characters: [],
	alerts: [],
}


// Actions
const actions = {
	...makeFetchStory(),
	onApiError: ({ error }) => state =>
		({
			...state,
			alerts: [
				...state.alerts,
				{ message: error.message, type: 'error' }
			],
		}),
	// Init
	clearState: () => state =>
		({
			story: {},
			characters: [],
			alerts: [],
		}),
	onCreate: story_id => [
		action('clearState'),
		action('fetchStory', story_id),
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
		class: 'content',
		oncreate: () => actions.story_characters.onCreate(matcher.params.story_id),
	}, [
		StoryHeader({ ...state.story_characters.story, active: 'characters' }),
		Notifications(state.story_characters.alerts),
		article(
			state.story_characters.characters.map(
				x => Character(x, actions.story_characters)
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
