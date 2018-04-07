import xs from 'xstream'

import {
	header,
	i,
	a,
} from '@cycle/dom'
import isolate from '@cycle/isolate'


export default sources => isolate(({ DOM }) => {
	const open_sidebar$ = DOM.select('[data-show="sidebar"]').events('click')
	const route$ = DOM.select('[data-href]').events('click')
		.map(ev => ev.target.dataset.href)

	return {
		DOM: view(),
		open_sidebar$,
		router: route$,
	}
})(sources)

const view = () => xs.of(
	header('.toolbar.fixed', [
		i('.fa.fa-bars.pointer.toolbar-icon', { dataset: { show: 'sidebar' }}),
		a('.brand.pointer', { dataset: { href: '/stories' }}, 'Epic Stories'),
	])
)