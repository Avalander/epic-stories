import './header.scss'

import xs from 'xstream'

import {
	header,
	h1,
	h2,
	div,
	a,
} from '@cycle/dom'
import isolate from '@cycle/isolate'


export default sources => isolate(({ DOM, story$, active$, subtitle$=xs.of(null) }) => {
	const link_click$ = DOM.select('[data-href]').events('click')
		.map(ev => ev.target.dataset.href)

	return {
		DOM: view(story$, active$, subtitle$),
		router: link_click$,
	}
})(sources)

const view = (story$, active$, subtitle$) => xs.combine(story$, active$, subtitle$)
	.map(([{ _id, title }, active, subtitle ]) =>
		header('.story-header', [
			h1(title),
			subtitle ? h2(subtitle) : null,
			div('.tab-container', [
				renderLink('Chapters', `/stories/${_id}/chapters`, active === 'chapters'),
				renderLink('Characters', `/stories/${_id}/characters`, active === 'characters'),
				renderLink('My Character', `/stories/${_id}/my-character`, active === 'my-character'),
			]),
		])
	)

const renderLink = (title, href, active) =>
	a('.header-link', { class: { active }, dataset: (active ? {} : { href })}, title)