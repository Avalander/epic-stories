import 'scss/main.scss'

import xs from 'xstream'

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

import UnderConstruction from 'app/views/under-construction'
import StoryList from 'app/views/story-list'


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
		'/test': UnderConstruction,
		'/stories': StoryList,
	})

	const page$ = match$.map(({ path, value }) =>
		value({...sources, router: sources.router.path(path)}))
	const page_dom$ = page$.map(x => x.DOM).flatten()

	return {
		DOM: view(page_dom$),
		HTTP: page$.filter(x => 'HTTP' in x).map(x => x.HTTP).flatten(),
	}
}

const drivers = {
	DOM: makeDOMDriver('#root'),
	HTTP: makeHTTPDriver(),
	history: makeHistoryDriver(),
}

run(routerify(app, switchPath), drivers)