import 'scss/main.scss'

import xs from 'xstream'
import flattenConcurrently from 'xstream'

import { run } from '@cycle/run'
import {
	makeDOMDriver,
	div,
	span,
	i,
	header,
	h1,
	main,
} from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'

import { routerify } from 'cyclic-router'
import { makeHistoryDriver } from '@cycle/history'
import switchPath from 'switch-path'

import { error_codes } from 'result'

import Sidebar from 'app/components/sidebar'

import UnderConstruction from 'app/views/under-construction'
import StoryList from 'app/views/story-list'
import Story from 'app/views/story'
import MyCharacter from 'app/views/my-character'


const view = (page$, sidebar$) => xs.combine(page$, sidebar$)
	.map(([ page, sidebar ]) =>
		div([
			header('.toolbar.fixed', [
				i('.fa.fa-bars.pointer', { dataset: { show: 'sidebar' }}),
				span('Epic Stories'),
			]),
			sidebar,
			main('.with-fixed-toolbar', [
				page,
			])
		])
	)

const app = sources => {
	const match$ = sources.router.define({
		'/': UnderConstruction,
		'/stories': StoryList,
		'/stories/:story_id': story_id => sources => Story({ story_id$: xs.of(story_id), ...sources }),
		'/stories/:story_id/my-character': story_id => sources => MyCharacter({ story_id$: xs.of(story_id), ...sources }),
	})

	const page$ = match$.map(({ path, value }) =>
		value({...sources, router: sources.router.path(path)}))
	const page_dom$ = page$.map(x => x.DOM).flatten()
	const page_router$ = page$.filter(x => 'router' in x).map(x => x.router).flatten()

	sources.HTTP.select()
		.flatten()
		.map(res => res.body)
		.filter(result => 'ok' in result && !result.ok && result.error.code === error_codes.INVALID_CREDENTIALS)
		.addListener({
			next: () => window.location.href = '/login.html'
		})
	
	const current_story$ = sources.HTTP.select('fetch-story')
		.flatten()
		.map(res => res.body)
		.filter(res => res.ok)
		.map(res => [ res.result ])
	
	const open_sidebar$ = sources.DOM.select('[data-show="sidebar"').events('click')
	const sidebar = Sidebar({ ...sources, open$: open_sidebar$, current_story$ })

	return {
		DOM: view(page_dom$, sidebar.DOM),
		HTTP: page$.filter(x => 'HTTP' in x).map(x => x.HTTP).flatten(),
		router: xs.merge(page_router$, sidebar.router),
	}
}

const drivers = {
	DOM: makeDOMDriver('#root'),
	HTTP: makeHTTPDriver(),
	history: makeHistoryDriver(),
}

run(routerify(app, switchPath), drivers)