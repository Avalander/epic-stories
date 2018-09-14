import 'scss/main.scss'

import { app } from 'hyperapp'
import { location, Route, Switch } from '@hyperapp/router'
import { withFx } from '@hyperapp/fx'
import { article, h1, div, main } from '@hyperapp/html'

import { makeFetchJson, makeGo } from 'App/fx'

import { Toolbar, Sidebar } from 'App/components'
import {
	state as pages_state,
	actions as pages_actions,
	routes
} from 'App/pages'


// State
const state = {
	location: location.state,
	sidebar: Sidebar.state,
	...pages_state,
}


// Actions
const actions = {
	location: location.actions,
	sidebar: Sidebar.actions,
	...pages_actions,
}


// View
const view = (state, actions) =>
	div([
		Toolbar(),
		Sidebar.view(state, actions),
		main({ class: 'with-fixed-toolbar' }, [
			Switch({},
				routes.map(
					({ path, view }) =>
						Route({ path, render: ({ match }) => view(state, actions, match) })
				)
			),
		]),
	])


// Start
const epic_stories = withFx({
	fetchJson: makeFetchJson(),
	go: makeGo(),
}) (app) (state, actions, view, document.body)
location.subscribe(epic_stories.location)
