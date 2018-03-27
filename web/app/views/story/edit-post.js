import './edit-post.scss'

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

import { renderErrors } from 'app/render'


export default sources => isolate(({ DOM, open$, save_post }) => {
	const close$ = xs.merge(
		DOM.select('[data-toggle="hide"]').events('click'),
		save_post.response$,
	)
	.mapTo(false)
	const show$ = xs.merge(open$, close$)

	const input$ = DOM.select('#text').events('input')
		.map(ev => ev.target.value)
		.startWith('')
	
	const state$ = xs.merge(input$, close$.mapTo(''))

	const save_click$ = DOM.select('[data-action="save"]').events('click')
		.map(ev => ev.target.dataset.meta)
	const post$ = save_click$.compose(sampleCombine(state$))
		.map(([ is_meta, text ]) => {
			const type = is_meta ? 'meta' : 'regular'
			return { type, text }
		})
	
	const errors$ = xs.merge(
		save_post.error$.map(e => [ e ]),
		save_post.response$.map(() => []),
		close$.map(() => []),
	)
	.startWith([])

	return {
		DOM: view(show$, state$, errors$),
		post$,
	}
})(sources)

const view = (open$, state$, errors$) => xs.combine(open$, state$, errors$).map(([ open, text, errors ]) =>
	div('.edit-panel', { class: { open }}, 
		div('.content', [
			renderErrors(errors),
			div('.form-group', [
				textarea({ props: { name: 'text', id: 'text', value: text }}),
			]),
			div('.button-container', [
				button('.btn', { dataset: { toggle: 'hide' }}, 'Cancel'),
				button('.btn', { dataset: { action: 'save', meta: true }}, 'Post meta'),
				button('.btn.primary', { dataset: { action: 'save' }}, 'Post'),
			])
		])
	)
)
