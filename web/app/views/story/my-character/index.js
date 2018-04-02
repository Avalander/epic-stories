import './my-character.scss'

import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

import {
	div,
	h1,
	span,
	label,
	input,
	button,
	textarea,
} from '@cycle/dom'

import {
	makeFetch,
	makePost,
} from 'app/http'
import { renderErrors } from 'app/render'

import StoryHeader from '../header'


const MyCharacter = ({ DOM, HTTP, story_id$ }) => {
	const api_url$ = story_id$.map(x => `/api/stories/${x}/my-character`)
	const fetch_character = makeFetch(HTTP, 'fetch-character', api_url$)
	const save_character = makePost(HTTP, 'save-character', api_url$)
	const fetch_story = makeFetch(HTTP, 'fetch-story',
		story_id$.map(x => `/api/stories/${x}`))
	const story$ = fetch_story.response$

	const story_header = StoryHeader({ DOM, story$, active$: xs.of('my-character') })

	const input$ = DOM.select('input, textarea').events('input')
		.map(ev => ({ [ev.target.id]: ev.target.value }))

	const character_data$ = xs.merge(
			fetch_character.response$,
			input$,
			story_id$.map(story_id => ({ story_id }))
		)
		.fold((prev, x) => ({ ...prev, ...x }), {})
	
	const cancel$ = DOM.select('[data-action="cancel"]').events('click')
		.mapTo({ type: 'goBack' })
	const save$ = DOM.select('[data-action="save"]').events('click')

	const save_character_request$ = save_character.makeRequest(
		save$.compose(sampleCombine(character_data$))
			.map(([ _, data ]) => data)
	)
	const request$ = xs.merge(fetch_character.request$, save_character_request$, fetch_story.request$)

	const errors$ = xs.merge(
		save_character.error$.map(error => [ error ]),
		save$.mapTo([])
	)
	.startWith([])
	const success$ = save_character.response$.compose(sampleCombine(story_id$))
		.map(([ _, story_id ]) => `/stories/${story_id}`)

	return {
		DOM: view(story_header.DOM, character_data$, errors$),
		HTTP: request$,
		router: xs.merge(cancel$, success$, story_header.router),
	}
}

const formGroup = (value, name, display_text, description) => div('.form-group', [
	label(display_text || name),
	description ? span('.text-description', description) : null,
	input({ attrs: { name, id: name, value }}),
])

const view = (story_header$, input$, errors$) => xs.combine(story_header$, input$, errors$)
	.map(([ story_header, state, errors ]) =>
		div('.content', [
			story_header,
			renderErrors(errors),
			formGroup(state.name, 'name', 'Name'),
			formGroup(state.high_concept, 'high_concept', 'Character Concept',
				'A phrase that sums up what your character is about. Who they are and what they do.'),
			formGroup(state.trouble, 'trouble', 'Trouble',
				'Something that usually complicates your character\'s existence, bringing chaos into their life and driving them into interesting situations.'),
			div('.form-group', [
				label('Description'),
				textarea({ props: { name: 'description', id: 'description', value: state.description }})
			]),
			div('.button-container', [
				button('.btn', { dataset: { action: 'cancel' }}, 'Cancel'),
				button('.btn.primary', { dataset: { action: 'save' }}, 'Save'),
			])
		])
	)

export default MyCharacter
