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


const MyCharacter = ({ DOM, HTTP, story_id$ }) => {
	const fetch_character_response$ = HTTP.select('fetch-character')
		.flatten()
		.map(res => res.body)
		.filter(result => result.ok)
		.map(result => result.result)

	const input$ = DOM.select('input, textarea').events('input')
		.map(ev => ({ [ev.target.id]: ev.target.value }))

	const request_data$ = xs.merge(
			fetch_character_response$,
			input$,
			story_id$.map(story_id => ({ story_id }))
		)
		.fold((prev, x) => ({ ...prev, ...x }), {})
	
	const cancel$ = DOM.select('[data-action="cancel"]').events('click')
		.mapTo({ type: 'goBack' })
	const save$ = DOM.select('[data-action="save"]').events('click')

	const fetch_character_request$ = story_id$.map(story_id => ({
		url: `/api/stories/${story_id}/my-character`,
		method: 'GET',
		withCredentials: true,
		category: 'fetch-character',
	}))
	const save_character_request$ = save$.compose(sampleCombine(request_data$))
		.map(([ _, data ]) => ({
			url: `/api/stories/${data.story_id}/my-character`,
			method: 'POST',
			withCredentials: true,
			category: 'save-character',
			send: data,
		}))
	const request$ = xs.merge(fetch_character_request$, save_character_request$)
	
	const save_character_response$ = HTTP.select('save-character')
		.flatten()
		.map(res => res.body)
	const save_character_errors$ = save_character_response$
		.filter(result => !result.ok)
		.map(result => [ result.error ])
	const save_character_success$ = save_character_response$
		.filter(result => result.ok)

	const errors$ = xs.merge(save_character_errors$, save$.mapTo([]))
		.startWith([])
	const success$ = save_character_success$.compose(sampleCombine(story_id$))
		.map(([ _, story_id ]) => `/stories/${story_id}`)

	return {
		DOM: view(request_data$, errors$),
		HTTP: request$,
		router: xs.merge(cancel$, success$),
	}
}

const formGroup = (value, name, display_text) => div('.form-group', [
	label(display_text || name),
	input({ attrs: { name, id: name, value }}),
])

const displayErrors = errors =>
	div('.alert-container', errors.map(({ message }) => div('.alert-error', message)))

const view = (input$, errors$) => xs.combine(input$, errors$).map(([ state, errors ]) =>
	div('.panel.content', [
		h1('My Character'),
		displayErrors(errors),
		formGroup(state.name, 'name', 'Name'),
		formGroup(state.high_concept, 'high_concept', 'Character Concept'),
		formGroup(state.trouble, 'trouble', 'Trouble'),
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
