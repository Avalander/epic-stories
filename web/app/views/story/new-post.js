import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

import {
	div,
	span,
	label,
	textarea,
	button,
} from '@cycle/dom'
import isolate from '@cycle/isolate'


const Inactive = () => div('.button-container.mt-10',
	button('.btn.primary', { dataset: { toggle: 'active' }}, 'New post'))

const Active = (text) => div('.phantom-panel.mt-10', [
	div('.form-group', [
		textarea({ props: { name: 'text', id: 'text', value: text }}),
	]),
	div('.button-container', [
		button('.btn', { dataset: { toggle: 'inactive' }}, 'Cancel'),
		button('.btn.primary', { dataset: { action: 'save' }}, 'Save'),
	])
])

export default sources => isolate(({ DOM }) => {
	const active_click$ = DOM.select('[data-toggle="active"]').events('click').mapTo(Active)
	const inactive_click$ = DOM.select('[data-toggle="inactive"]').events('click').mapTo(Inactive)
	
	const input$ = DOM.select('#text').events('input')
		.map(ev => ev.target.value)
		.startWith('')
		
	const save_click$ = DOM.select('[data-action="save"]').events('click')
	const new_post$ = save_click$.compose(sampleCombine(input$))
		.map(([ _, text ]) => text)
	const send_post$ = new_post$.mapTo(Inactive)
	
	const toggle$ = xs.merge(active_click$, inactive_click$, send_post$)
		.startWith(Inactive)

	return {
		DOM: view(toggle$, input$),
		new_post$,
	}
})(sources)

const view = (toggle$, input$) => xs.combine(toggle$, input$)
	.map(([ component, input ]) => component(input))