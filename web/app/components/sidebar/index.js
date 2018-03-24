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
	img,
} from '@cycle/dom'
import isolate from '@cycle/isolate'

import pinkie from 'app/pinkie.png'


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
	/*
		.map(stories => [
			{ name: 'All Stories', href: '/stories' },
			...stories.map(({ title, _id }) => ({
				name: title, href: `/stories/${_id}`
			})),
			...stories.map(({ _id }) => ({
				name: 'My Character', href: `/stories/${_id}/my-character`, subcomponent: true
			})),
			...stories.map(({ _id }) => ({
				name: 'Characters', href: `/stories/${_id}/characters`, subcomponent: true
			})),
		])
		*/
	
	const route$ = DOM.select('[data-href]').events('click')
		.map(ev => ev.target.dataset.href)
	
	const state$ = xs.merge(show$, hide$, remove_overlay$)
		.startWith(state.remove_overlay)

	return {
		DOM: view(state$, items$),
		router: route$,
	}
})(sources)

const renderStory = ({ title, _id }) => ([
	li(a({ dataset: { hide: true, href: `/stories/${_id}`}}, title)),
	li(a('.subcomponent', { dataset: { hide: true, href: `/stories/${_id}/my-character`}}, 'My Character')),
	li(a('.subcomponent', { dataset: { hide: true, href: `/stories/${_id}/characters`}}, 'Characters')),
])

const view = (state$, stories$/*, active_id$*/) => xs.combine(state$, stories$/*, active_id$*/)
	.map(([{ active, overlay }, stories ]) => div([
		nav('.sidebar', { class: { active }}, [
			div([
				button('.dismiss', { dataset: { hide: true }}, i('.fa.fa-arrow-left')),
				div('.sidebar-header', [
					img('.avatar', { props: { src: pinkie }}),
					h3('Epic Stories'),
				]),
				ul('.components', [
					li(a({ dataset: { hide: true, href: `/stories`}}, 'All Stories')),
					...(stories.length > 0 ? renderStory(stories[0]) : []),
				]),
				/*
				ul('.components', items.map(({ name, href, subcomponent }) =>
					li(a({ class: { subcomponent }, dataset: { href, hide: true }}, name))
				))
				*/
			]),
		]),
		div('.overlay', {
			class: { invisible: !overlay, appear: active, disappear: !active },
			dataset: { hide: true },
		}),
	]))

export default Sidebar
