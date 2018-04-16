import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

import {
	div,
	span,
	input,
	button,
	label,
	h1,
	p,
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
	const preferences_url$ = xs.of('/api/user/preferences')
	const fetch_user = makeFetch(HTTP, 'fetch-user', xs.of('/api/user'))
	const fetch_preferences = makeFetch(HTTP, 'fetch-user-preferences', preferences_url$)
	const save_preferences = makePost(HTTP, 'save-user-preferences', preferences_url$)
	const errors$ = xs.merge(
		fetch_user.error$,
		fetch_preferences.error$,
		save_preferences.error$,
	)

	const input$ = DOM.select('input').events('input')
		.map(ev => ({ [ev.target.id]: ev.target.value }))
	
	const preferences$ = xs.merge(
			fetch_preferences.response$.map(x => x == null ? {} : x),
			input$,
		)
		.fold((prev, x) => ({ ...prev, ...x }), {})

	const save_click$ = DOM.select('[data-action="save"]').events('click')
	const save_preferences_request$ = save_preferences.makeRequest(
		save_click$.compose(sampleCombine(preferences$))
			.map(([ _, data ]) => data)
	)

	const messages$ = xs.merge(
		errors$.map(error => [{ ...error, type: 'error' }]),
		save_preferences.response$.mapTo([{ message: 'Preferences saved successfully.', type: 'success' }]),
	)
	.startWith([])

	const request$ = xs.merge(
		fetch_user.request$,
		fetch_preferences.request$,
		save_preferences_request$,
	)

	return {
		DOM: view(fetch_user.response$, preferences$, messages$),
		HTTP: request$,
	}
}

const view = (user$, preferences$, messages$) => xs.combine(user$, preferences$, messages$)
	.map(([{ username }, { display_name }, messages]) =>
		div('.content', [
			h1('.page-title', 'Preferences'),
			renderAlerts(messages),
			renderReadField(username, 'Username'),
			renderFormGroup(display_name, 'display_name', 'Display Name',
				'A name that will be displayed instead of your username. Leave blank to display your username.'),
			div('.button-container', [
				button('.btn.primary', { dataset: { action: 'save' }}, 'Save'),
			]),
		])
	)

const renderReadField = (value, name, description) =>
	div('.form-group', [
		label(name),
		description ? span('.text-description') : null,
		p(value),
	])



const MyCharacter = ({ DOM, HTTP, story_id$ }) => {
	
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
