import 'scss/main.scss'

import xs from 'xstream'
import flattenConcurrently from 'xstream'

import { run } from '@cycle/run'
import {
	makeDOMDriver,
	div,
	header,
	h1,
	main,
} from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'

import { routerify } from 'cyclic-router'
import { makeHistoryDriver } from '@cycle/history'
import switchPath from 'switch-path'

import { error_codes } from 'result'

import UnderConstruction from 'app/views/under-construction'
import StoryList from 'app/views/story-list'
import MyCharacter from 'app/views/my-character'


const view = (page$) => page$.map(x =>
	div([
		header('.toolbar.fixed', 'Epic Stories'),
		main('.with-fixed-toolbar', [
			x,
		])
	])
)

const app = sources => {
	const match$ = sources.router.define({
		'/': UnderConstruction,
		'/stories': StoryList,
		'/stories/:story_id': story_id => sources => UnderConstruction(sources),
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

	return {
		DOM: view(page_dom$),
		HTTP: page$.filter(x => 'HTTP' in x).map(x => x.HTTP).flatten(),
		router: page_router$,
	}
}

const drivers = {
	DOM: makeDOMDriver('#root'),
	HTTP: makeHTTPDriver(),
	history: makeHistoryDriver(),
}

run(routerify(app, switchPath), drivers)