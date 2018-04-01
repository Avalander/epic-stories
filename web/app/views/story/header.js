import './header.scss'

import xs from 'xstream'

import {
	header,
	h1,
	div,
	a,
} from '@cycle/dom'
import isolate from '@cycle/isolate'


export default sources => isolate(({ DOM, story$, }) => {
	const link_click$ = DOM.select('[data-href]').events('click')
		.map(ev => ev.target.dataset.href)

	return {
		DOM: view(story$),
		router: link_click$,
	}
})(sources)

const view = story$ => story$.map(({ _id, title }) =>
	header('.story-header', [
		h1(title),
		div('.tab-container', [
			a('.header-link', {}, 'Chapters'),
			a('.header-link', { dataset: { href: `/stories/${_id}/characters` }}, 'Characters'),
			a('.header-link', { dataset: { href: `/stories/${_id}/my-character` }}, 'My character'),
		]),
	])
)