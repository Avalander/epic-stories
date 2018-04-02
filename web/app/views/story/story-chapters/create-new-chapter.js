import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

import {
	div,
	input,
	button
} from '@cycle/dom'
import isolate from '@cycle/isolate'

import { renderFormGroup } from 'app/render'


export default sources => isolate(({ DOM, story$, clear$ }) => {
	const open_click$ = DOM.select('[data-action="open"]').events('click')
		.mapTo(true)
	const close_click$ = DOM.select('[data-action="close"]').events('click')
		.mapTo(false)
	const open$ = xs.merge(open_click$, close_click$, clear$.mapTo(false))
		.startWith(false)
	
	const input$ = DOM.select('input').events('input')
		.map(ev => ev.target.value)
	const title$ = xs.merge(input$, clear$.mapTo(''))
		.startWith('')
	
	const save_click$ = DOM.select('[data-action="save"]').events('click')
	const save$ = save_click$.compose(sampleCombine(title$))
		.map(([ _, title ]) => ({ title }))
	
	return {
		DOM: view(open$, title$),
		save$,
	}
})(sources)

const view = (open$, title$) => xs.combine(open$, title$)
	.map(([ open, title ]) => open
		? renderActive(title)
		: renderInactive()
	)

const renderInactive = () =>
	div('.button-container', [
		button('.btn.primary', { dataset: { action: 'open' }}, 'New chapter'),
	])

const renderActive = title =>
	div([
		renderFormGroup(title, 'title', 'Title'),
		div('.button-container', [
			button('.btn', { dataset: { action: 'close' }}, 'Cancel'),
			button('.btn.primary', { dataset: { action: 'save' }}, 'Save'),
		]),
	])
