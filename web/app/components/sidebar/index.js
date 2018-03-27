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

const Sidebar = sources => isolate(({ DOM, IDB, open$, current_story$ }) => {
	const show$ = open$
		.mapTo(state.show)
	const hide$ = xs.merge(DOM.select('[data-hide]').events('click'))
		.mapTo(state.hide)
	const remove_overlay$ = DOM.select('.overlay.disappear').events('transitionend')
		.mapTo(state.remove_overlay)
	const current_user$ = IDB.store('user-cache').get('current_user')
		.map(({ username }) => username)

	const items$ = current_story$.startWith([])
	
	const route$ = DOM.select('[data-href]').events('click')
		.map(ev => ev.target.dataset.href)
	
	const state$ = xs.merge(show$, hide$, remove_overlay$)
		.startWith(state.remove_overlay)

	return {
		DOM: view(state$, items$, current_user$),
		router: route$,
	}
})(sources)

const renderStory = ({ title, _id }) => ([
	li(a({ dataset: { hide: true, href: `/stories/${_id}`}}, title)),
	li(a('.subcomponent', { dataset: { hide: true, href: `/stories/${_id}/my-character`}}, 'My Character')),
	li(a('.subcomponent', { dataset: { hide: true, href: `/stories/${_id}/characters`}}, 'Characters')),
])

const view = (state$, stories$, current_user$) => xs.combine(state$, stories$, current_user$)
	.map(([{ active, overlay }, stories, user ]) => div([
		nav('.sidebar', { class: { active }}, [
			div([
				button('.dismiss', { dataset: { hide: true }}, i('.fa.fa-arrow-left')),
				div('.sidebar-header', [
					img('.avatar', { props: { src: pinkie }}),
					h3(user),
				]),
				ul('.components', [
					li(a({ dataset: { hide: true, href: `/stories`}}, 'All Stories')),
					...(stories.length > 0 ? renderStory(stories[0]) : []),
				]),
			]),
		]),
		div('.overlay', {
			class: { invisible: !overlay, appear: active, disappear: !active },
			dataset: { hide: true },
		}),
	]))

export default Sidebar
