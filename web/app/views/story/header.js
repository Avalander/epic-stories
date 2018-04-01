import './header.scss'

import xs from 'xstream'

import {
	header,
	h1,
	div,
	a,
} from '@cycle/dom'
import isolate from '@cycle/isolate'


export default sources => isolate(({ DOM, story$, active$ }) => {
	const link_click$ = DOM.select('[data-href]').events('click')
		.map(ev => ev.target.dataset.href)

	return {
		DOM: view(story$, active$),
		router: link_click$,
	}
})(sources)

const view = (story$, active$) => xs.combine(story$, active$)
	.map(([{ _id, title }, active ]) =>
		header('.story-header', [
			h1(title),
			div('.tab-container', [
				renderLink('Chapters', `/stories/${_id}/chapters`, active === 'chapters'),
				renderLink('Characters', `/stories/${_id}/characters`, active === 'characters'),
				renderLink('My Character', `/stories/${_id}/my-character`, active === 'my-character'),
			]),
		])
	)

const renderLink = (title, href, active) =>
	a('.header-link', { class: { active }, dataset: (active ? {} : { href })}, title)