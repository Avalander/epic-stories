import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

import {
	div,
	span,
	input,
	button,
	h1,
} from '@cycle/dom'

import {
	makeFetch,
	makePost,
} from 'app/http'

import {
	renderAlerts,
	renderFormGroup,
} from 'app/render'


export default ({ DOM, HTTP }) => {
	const preferences_url$ = xs.of('/api/preferences')
	const fetch_preferences = makeFetch(HTTP, 'fetch-user-preferences', preferences_url$)
	const save_preferences = makePost(HTTP, 'save-user-preferences', preferences_url$)

	return {
		DOM: view(),
	}
}

const view = () => xs.of(
	div('.content', [
		h1('.page-title', 'Preferences'),
		renderAlerts([]),
		renderFormGroup('', 'display_name', 'Display Name',
			'A name that will be displayed instead of your username. Leave blank to display your username.'),
		div('.button-container', [
			button('.btn.primary', { dataset: { action: 'save' }}, 'Save'),
		]),
	])
)


const MyCharacter = ({ DOM, HTTP, story_id$ }) => {

	const input$ = DOM.select('input, textarea').events('input')
		.map(ev => ({ [ev.target.id]: ev.target.value }))

	const character_data$ = xs.merge(
			fetch_character.response$,
			input$,
			story_id$.map(story_id => ({ story_id }))
		)
		.fold((prev, x) => ({ ...prev, ...x }), {})
	
	const save$ = DOM.select('[data-action="save"]').events('click')

	const save_character_request$ = save_character.makeRequest(
		save$.compose(sampleCombine(character_data$))
			.map(([ _, data ]) => data)
	)
	const request$ = xs.merge(fetch_character.request$, save_character_request$, fetch_story.request$)

	const success$ = save_character.response$.compose(sampleCombine(story_id$))
		.map(([ _, story_id ]) => `/stories/${story_id}`)
	
	const messages$ = xs.merge(
		save_character.error$.map(error => [{ ...error, type: 'error' }]),
		save$.mapTo([]),
		success$.mapTo([{ message: 'Character saved successfylly.', type: 'success' }])
	)
	.startWith([])

	return {
		DOM: view(story_header.DOM, character_data$, messages$),
		HTTP: request$,
		router: story_header.router,
	}
}
