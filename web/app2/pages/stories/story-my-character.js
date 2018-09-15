import { div, span, a, label, input, button, textarea, article } from '@hyperapp/html'
import { action } from '@hyperapp/fx'

import { fetchJson, postJson } from 'App/fx'
import { Notifications } from 'App/components'

import StoryHeader from './_story-header'
import makeFetchStory from './_story-fetch'


// State

const state = {
	alerts: [],
	form: {},
	story: {},
}


// Actions

const actions = {
	// Fetch story
	...makeFetchStory(),
	onApiError: ({ error }) => state =>
		({
			...state,
			alerts: [
				...state.alerts,
				{ message: error.message, type: 'error' }
			]
		}),
	// Fetch Character
	fetchCharacter: story_id =>
		fetchJson(
			`/api/stories/${story_id}/my-character`,
			'onFetchCharacterSuccess',
			'onApiError'
		),
	onFetchCharacterSuccess: ({ result }) => state =>
		({
			...state,
			form: result || {},
		}),
	// Form
	onInput: ([ key, value ]) => state =>
		({
			...state,
			form: {
				...state.form,
				[key]: value,
			},
		}),
	clearState: () => state =>
		({
			alerts: [],
			story: {},
			form: {},
		}),
	onCreate: story_id => [
		action('clearState'),
		action('fetchStory', story_id),
		action('fetchCharacter', story_id),
	],
	// Save character
	save: () => state =>
		postJson(
			`/api/stories/${state.story._id}/my-character`,
			'onSaveSuccess',
			'onApiError',
			{ ...state.form,
				story_id: state.story._id
			}
		),
	onSaveSuccess: () => state =>
		({
			...state,
			alerts: [
				{ message: 'Character saved successfully', type: 'success' }
			],
		}),
}


// View

const view = (state, actions, matcher) =>
	article({
		key: 'story-my-character',
		class: 'content',
		oncreate: () => actions.story_my_character.onCreate(matcher.params.story_id),
	}, [
		StoryHeader({ ...state.story_my_character.story, active: 'my-character' }),
		Notifications(state.story_my_character.alerts),
		FormGroup({
			value: state.story_my_character.form.name,
			name: 'name',
			title: 'Name',
			onInput: actions.story_my_character.onInput,
		}),
		FormGroup({
			value: state.story_my_character.form.high_concept,
			name: 'high_concept',
			title: 'Character Concept',
			description: 'A phrase that sums up what your character is about. Who they are and what they do.',
			onInput: actions.story_my_character.onInput,
		}),
		FormGroup({
			value: state.story_my_character.form.trouble,
			name: 'trouble',
			title: 'Trouble',
			description: 'Something that usually complicates your character\'s existence, bringing chaos into their life and driving them into interesting situations.',
			onInput: actions.story_my_character.onInput,
		}),
		div({ class: 'form-group' }, [
			label('Description'),
			div({ class: 'text-description' }, [
				span('This field supports markdown syntax. Check '),
				a({ class: 'link', href: 'https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet', target: '_blank' },
					'this link'
				),
				span(' for more information.'),
			]),
			textarea({
				value: state.story_my_character.form.description,
				oninput: ev => actions.story_my_character.onInput([ 'description', ev.target.value ]),
			}),
		]),
		div({ class: 'button-container' }, [
			button({
				class: 'btn primary',
				onclick: () => actions.story_my_character.save()
			}, 'Save'),
		]),
	])

const FormGroup = ({ value, name, title, description, onInput }) =>
	div({ class: 'form-group' }, [
		label(title || name),
		description
			? span({ class: 'text-description' }, description)
			: null,
		input({
			type: 'text',
			value,
			oninput: ev => onInput([ name, ev.target.value ]),
		})
	])
	

// Export

export default {
	state,
	actions,
	view,
}
