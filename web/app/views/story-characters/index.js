import './story-characters.scss'

import xs from 'xstream'

import {
	div,
	h1,
	h4,
	i,
	p,
	span,
} from '@cycle/dom'

import { makeFetch } from 'app/http'
import { makeReducer } from 'app/reducer'
import { renderErrors } from 'app/render'


const charactersReducer = makeReducer({
	fetch: (prev, characters) => characters,
	toggle: (prev, char_id) => prev.map(x => x._id === char_id ? ({ ...x, _expand: !x._expand }) : x),
})

const StoryCharacters = ({ DOM, HTTP, story_id$}) => {
	const fetch_story = makeFetch(HTTP, 'fetch-story', story_id$.map(x => `/api/stories/${x}`))
	const fetch_characters = makeFetch(HTTP, 'fetch-characters', story_id$.map(x => `/api/stories/${x}/characters`))

	const errors$ = xs.merge(
		fetch_story.error$,
		fetch_characters.error$,
	)

	const characters_response$ = fetch_characters.response$
		.map(data => ({ type: 'fetch', data }))
	
	const toggle_character$ = DOM.select('[data-toggle]').events('click')
		.map(ev => ev.target.dataset.toggle)
		.map(character_id => ({ type: 'toggle', data: character_id }))
	
	const characters$ = xs.merge(characters_response$, toggle_character$)
		.fold(charactersReducer, [])
	

	return {
		DOM: view(
			fetch_story.response$,
			characters$,
			errors$.startWith([]),
		),
		HTTP: xs.merge(
			fetch_characters.request$,
			fetch_story.request$,
		),
	}
}

const view = (story$, characters$, errors$) => xs.combine(story$, characters$, errors$)
	.startWith([{}, [], []])
	.map(([ story, characters, errors ]) =>
		div('.content', [
			h1(`${story.title} characters`),
			renderErrors(errors),
			div(characters.map(renderCharacter)),
		])
	)

const renderCharacter = ({ name, username, high_concept, trouble, description='', _id, _expand }) =>
	div('.character-panel', [
		div('.character-header', [
			h4(name),
			i('.fa.pointer', {
				class: { 'fa-caret-down': !_expand, 'fa-caret-up': _expand },
				dataset: { toggle: _id },
			}),
		]),
		div('.character-body', { class: { hide: !_expand }}, [
			renderField('Player', username),
			renderField('High Concept', high_concept),
			renderField('Trouble', trouble),
			renderField('Description', description.split('\n').map(x => p(x))),
		]),
	])

const renderField = (title, value) => div('.field', [
	span('.field-title', title),
	span('.text', value),
])

export default StoryCharacters
