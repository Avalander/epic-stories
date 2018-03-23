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

const Sidebar = sources => isolate(({ DOM, open$, /*items$, active_id$*/ }) => {
	const show$ = open$
		.mapTo(state.show)
	const hide$ = xs.merge(DOM.select('[data-hide]').events('click'))
		.mapTo(state.hide)
	const remove_overlay$ = DOM.select('.overlay.disappear').events('transitionend')
		.mapTo(state.remove_overlay)
	
	const state$ = xs.merge(show$, hide$, remove_overlay$)
		.startWith(state.remove_overlay)

	const items$ = xs.of([{
		id: 1,
		name: 'Stories'
	}, {
		id: 2,
		name: 'Potato'
	}])
	const active_id$ = xs.of(1)

	return {
		DOM: view(state$, items$, active_id$),
	}
})(sources)

const view = (state$, items$, active_id$) => xs.combine(state$, items$, active_id$)
	.map(([{ active, overlay }, items, active_id ]) => div([
		nav('.sidebar', { class: { active }}, [
			div([
				button('.dismiss', { dataset: { hide: true }}, i('.fa.fa-arrow-left')),
				div('.sidebar-header', h3('Epic Stories')),
				ul('.components', items.map(({ name, id }) =>
					li({ class: { active: active_id == id }}, a({ dataset: { id }}, name))
				))
			]),
		]),
		div('.overlay', {
			class: { invisible: !overlay, appear: active, disappear: !active },
			dataset: { hide: true },
		}),
	]))

export default Sidebar
