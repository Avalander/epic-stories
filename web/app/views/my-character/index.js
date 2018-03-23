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
		formGroup(state.high_concept, 'high_concept', 'High Concept'),
		formGroup(state.trouble, 'trouble', 'Trouble'),
		div('.form-group', [
			label('Description'),
			textarea({ attrs: { name: 'description', id: 'description', value: state.description }})
		]),
		div('.button-container', [
			button('.btn', { dataset: { action: 'cancel' }}, 'Cancel'),
			button('.btn.primary', { dataset: { action: 'save' }}, 'Save'),
		])
	])
)

const MyCharacter = ({ DOM, HTTP, story_id$ }) => {
	const input$ = DOM.select('input, textarea').events('input')
		.map(ev => ({ [ev.target.id]: ev.target.value }))
		.fold((prev, x) => ({ ...prev, ...x }), {})

	const request_data$ = xs.merge(input$, story_id$.map(story_id => ({ story_id })))
		.fold((prev, x) => ({ ...prev, ...x }))
	
	const cancel$ = DOM.select('[data-action="cancel"]').events('click')
		.mapTo({ type: 'goBack' })
	const save$ = DOM.select('[data-action="save"]').events('click')

	const request$ = save$.compose(sampleCombine(request_data$))
		.map(([ _, data ]) => ({
			url: `/api/stories/${data.story_id}/my-character`,
			method: 'POST',
			withCredentials: true,
			category: 'save-character',
			send: data,
		}))
	
	const save_character_response$ = HTTP.select('save-character')
		.flatten()
		.map(res => res.body)
	const save_character_errors$ = save_character_response$
		.filter(result => !result.ok)
		.map(result => [ result.error ])
	const errors$ = xs.merge(save_character_errors$, save$.mapTo([]))
		.startWith([])

	return {
		DOM: view(input$, errors$),
		HTTP: request$,
		router: cancel$,
	}
}

export default MyCharacter
