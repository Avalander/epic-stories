import xs from 'xstream'

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

const Active = () => div('.new-story.panel', [
	div('.form-group', [
		label('Title'),
		input(),
	]),
	div([
		button('.btn', { dataset: { toggle: 'inactive' }}, 'Cancel'),
		button('.btn.primary', 'Save'),
	])
])

export default sources => isolate(({ DOM }) => {
	const active_click$ = DOM.select('[data-toggle="active"]').events('click').mapTo(Active)
	const inactive_click$ = DOM.select('[data-toggle="inactive"]').events('click').mapTo(Inactive)
	const toggle$ = xs.merge(active_click$, inactive_click$)
		.startWith(Inactive)

	const vtree$ = toggle$.map(x => x())

	return {
		DOM: vtree$,
	}
})(sources)