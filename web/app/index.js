import 'scss/main.scss'

import xs from 'xstream'
import flattenConcurrently from 'xstream'

import { run } from '@cycle/run'
import {
	makeDOMDriver,
	div,
	main,
} from '@cycle/dom'
import { makeHTTPDriver } from '@cycle/http'

import makeIdbDriver from 'cycle-idb'

import { routerify } from 'cyclic-router'
import { makeHistoryDriver } from '@cycle/history'
import switchPath from 'switch-path'

import { error_codes } from 'result'

import initApp from 'app/init'
import {
	database_version,
	initDatabase,
} from 'app/database'

import Sidebar from 'app/components/sidebar'
import Header from 'app/components/header'

import Preferences from 'app/views/preferences'
import MyCharacter from 'app/views/story/my-character'
import Story from 'app/views/story'
import StoryChapters from 'app/views/story/story-chapters'
import StoryCharacters from 'app/views/story/story-characters'
import StoryList from 'app/views/story-list'
import Welcome from 'app/views/welcome'


const view = (page$, sidebar$, header$) => xs.combine(page$, sidebar$, header$)
	.map(([ page, sidebar, header ]) =>
		div([
			header,
			sidebar,
			main('.with-fixed-toolbar', [
				page,
			])
		])
	)

const app = sources => {
	const match$ = sources.router.define({
		'/': StoryList,
		'/stories': StoryList,
		'/stories/:story_id': story_id => sources => Story({ story_id$: xs.of(story_id), ...sources }),
		'/stories/:story_id/my-character': story_id => sources => MyCharacter({ story_id$: xs.of(story_id), ...sources }),
		'/stories/:story_id/characters': story_id => sources => StoryCharacters({ story_id$: xs.of(story_id), ...sources }),
		'/stories/:story_id/chapters': story_id => sources => StoryChapters({ story_id$: xs.of(story_id), ...sources }),
		'/stories/:story_id/chapters/:chapter_id/posts': (story_id, chapter_id) => sources => Story({ ...sources, story_id$: xs.of(story_id), chapter_id$: xs.of(chapter_id) }),
		'/preferences': Preferences,
		'/welcome': Welcome,
	})

	const page$ = match$.map(({ path, value }) =>
		value({...sources, router: sources.router.path(path)}))
	const page_dom$ = page$
		.map(x => x.DOM)
		.flatten()
	const page_router$ = page$
		.filter(x => 'router' in x)
		.map(x => x.router)
		.flatten()
	const page_idb$ = page$
		.filter(x => 'IDB' in x)
		.map(x => x.IDB)
		.flatten()

	const invalid_credentials$ = sources.HTTP.select()
		.flatten()
		.map(res => res.body)
		.filter(result => 'ok' in result && !result.ok && result.error.code === error_codes.INVALID_CREDENTIALS)
	
	invalid_credentials$
		.addListener({
			next: () => window.location.href = `/login.html?to=${location.pathname}`
		})
	
	const current_story$ = sources.HTTP.select('fetch-story')
		.flatten()
		.map(res => res.body)
		.filter(res => res.ok)
		.map(res => [ res.result ])
	
	const header = Header(sources)
	const sidebar = Sidebar({ ...sources, open$: header.open_sidebar$, current_story$ })

	const init_app = initApp({ ...sources, invalid_credentials$ })
	const http$ = xs.merge(
		page$.filter(x => 'HTTP' in x).map(x => x.HTTP).flatten(),
		init_app.HTTP,
	)

	return {
		DOM: view(page_dom$, sidebar.DOM, header.DOM),
		HTTP: http$,
		IDB: xs.merge(init_app.IDB, page_idb$),
		router: xs.merge(page_router$, sidebar.router, header.router),
	}
}

const drivers = {
	DOM: makeDOMDriver('#root'),
	HTTP: makeHTTPDriver(),
	IDB: makeIdbDriver('epic-stories', database_version, initDatabase),
	history: makeHistoryDriver(),
}

run(routerify(app, switchPath), drivers)