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
import { makeReducer } from 'app/reducer'

import { parseDate } from './util'


const post_reducer = makeReducer({
	replace: (prev, x) => x,
	input: (prev, text) => ({ ...prev, text }),
})

export default sources => isolate(({ DOM, open$, edit_post$, save_post }) => {
	const close$ = xs.merge(
		DOM.select('[data-toggle="hide"]').events('click'),
		save_post.response$,
	)
	.mapTo(false)
	const show$ = xs.merge(open$, close$, edit_post$.mapTo(true))

	const incoming_post$ = xs.merge(
		open$.mapTo({ text: '' }),
		close$.mapTo({ text: '' }),
		edit_post$,
	)
	.map(data => ({ type: 'replace', data }))

	const input$ = DOM.select('#text').events('input')
		.map(ev => ev.target.value)
		.map(data => ({ type: 'input', data }))
	
	const state$ = xs.merge(
		incoming_post$,
		input$,
	)
	.fold(post_reducer, { text: '' })

	const save_click$ = DOM.select('[data-action="save"]').events('click')
		.map(ev => ev.target.dataset.meta)
	
	const post$ = save_click$.compose(sampleCombine(state$))
		.map(([ is_meta, post ]) => {
			const type = is_meta ? 'meta' : 'regular'
			return { ...post, type }
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

const view = (open$, state$, errors$) => xs.combine(open$, state$, errors$)
	.map(([ open, { text, _id, created_on }, errors ]) =>
		div('.edit-panel', { class: { open }}, 
			div('.content', [
				renderErrors(errors),
				div(_id ? [
					span('.text-muted', `Editing post created on ${parseDate(new Date(created_on))}`)
				] : []),
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
