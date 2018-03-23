import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

import {
	div,
	span,
	label,
	input,
	button,
} from '@cycle/dom'
import isolate from '@cycle/isolate'


const Inactive = () => div('.new-story.panel.primary', { dataset: { toggle: 'active' }}, [
	span('.handwriting', 'Start a new story.'),
])

const Active = value => div('.phantom-panel.m-10', [
	div('.form-group', [
		label('Title'),
		input('#title', { props: { value }}),
	]),
	div('.button-container', [
		button('.btn', { dataset: { toggle: 'inactive' }}, 'Cancel'),
		button('.btn.primary', { dataset: { action: 'save' }}, 'Save'),
	])
])

const view = (toggle$, state$) => xs.combine(toggle$, state$)
	.map(([ component, state ]) => component(state))

export default sources => isolate(({ DOM, clear$ }) => {
	const active_click$ = DOM.select('[data-toggle="active"]').events('click').mapTo(Active)
	const inactive_click$ = DOM.select('[data-toggle="inactive"]').events('click').mapTo(Inactive)
	const save_click$ = DOM.select('[data-action="save"]').events('click')

	const toggle$ = xs.merge(active_click$, inactive_click$, clear$.mapTo(Inactive))
		.startWith(Inactive)
	const input$ = DOM.select('#title').events('input')
		.map(ev => ev.target.value)
	
	const state$ = xs.merge(input$, clear$.mapTo(''))
		.startWith('')
	
	const new_story$ = save_click$.compose(sampleCombine(state$))
		.map(([ _, title ]) => ({ title }))
	
	return {
		DOM: view(toggle$, state$),
		new_story$,
	}
})(sources)