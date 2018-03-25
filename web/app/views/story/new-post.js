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
		button('.btn', { dataset: { action: 'save', meta: true }}, 'Post Meta'),
		button('.btn.primary', { dataset: { action: 'save' }}, 'Post'),
	])
])

export default sources => isolate(({ DOM, clear$ }) => {
	const active_click$ = DOM.select('[data-toggle="active"]').events('click').mapTo(Active)
	const inactive_click$ = DOM.select('[data-toggle="inactive"]').events('click').mapTo(Inactive)
	
	const input$ = DOM.select('#text').events('input')
		.map(ev => ev.target.value)
		.startWith('')

	const state$ = xs.merge(input$, clear$.mapTo(''))
		
	const save_click$ = DOM.select('[data-action="save"]').events('click')
		.map(ev => ev.target.dataset.meta)
	const new_post$ = save_click$.compose(sampleCombine(state$))
		.map(([ is_meta, text ]) => {
			const type = is_meta ? 'meta' : 'regular'
			return { text, type }
		})
	
	const toggle$ = xs.merge(active_click$, inactive_click$, clear$.mapTo(Inactive))
		.startWith(Inactive)

	return {
		DOM: view(toggle$, state$),
		new_post$,
	}
})(sources)

const view = (toggle$, input$) => xs.combine(toggle$, input$)
	.map(([ component, input ]) => component(input))