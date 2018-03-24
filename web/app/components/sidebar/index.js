import './sidebar.scss'

import xs from 'xstream'

import {
	div,
	nav,
	h3,
	ul,
	li,
	a,
	button,
	i,
	span,
} from '@cycle/dom'
import isolate from '@cycle/isolate'


const state = {
	show: { active: true, overlay: true },
	hide: { active: false, overlay: true },
	remove_overlay: { active: false, overlay: false },
}

const Sidebar = sources => isolate(({ DOM, open$, current_story$ }) => {
	const show$ = open$
		.mapTo(state.show)
	const hide$ = xs.merge(DOM.select('[data-hide]').events('click'))
		.mapTo(state.hide)
	const remove_overlay$ = DOM.select('.overlay.disappear').events('transitionend')
		.mapTo(state.remove_overlay)

	const items$ = current_story$.startWith([])
		.map(stories => [
			{ name: 'All Stories', href: '/stories' },
			...stories.map(({ title, _id }) => ({
				name: title, href: `/stories/${_id}`
			})),
			...stories.map(({ _id }) => ({
				name: 'My Character', href: `/stories/${_id}/my-character`, subcomponent: true
			}))
		])
	
	const route$ = DOM.select('[data-href]').events('click')
		.map(ev => ev.target.dataset.href)
	
	const state$ = xs.merge(show$, hide$, remove_overlay$)
		.startWith(state.remove_overlay)

	return {
		DOM: view(state$, items$),
		router: route$,
	}
})(sources)

const view = (state$, items$/*, active_id$*/) => xs.combine(state$, items$/*, active_id$*/)
	.map(([{ active, overlay }, items ]) => div([
		nav('.sidebar', { class: { active }}, [
			div([
				button('.dismiss', { dataset: { hide: true }}, i('.fa.fa-arrow-left')),
				div('.sidebar-header', h3('Epic Stories')),
				ul('.components', items.map(({ name, href, subcomponent }) =>
					li(a({ class: { subcomponent }, dataset: { href, hide: true }}, name))
				))
			]),
		]),
		div('.overlay', {
			class: { invisible: !overlay, appear: active, disappear: !active },
			dataset: { hide: true },
		}),
	]))

export default Sidebar
