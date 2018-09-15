import 'scss/main.scss'

import { app } from 'hyperapp'
import { location, Route, Switch } from '@hyperapp/router'
import { withFx } from '@hyperapp/fx'
import { div, main } from '@hyperapp/html'

import { makeFetchJson, makeGo, fetchJson } from 'App/fx'

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
	_user: {}
}


// Actions
const actions = {
	location: location.actions,
	sidebar: Sidebar.actions,
	...pages_actions,
	_user: {
		fetchUser: () =>
			fetchJson(
				'/api/user',
				'onFetchUserSuccess',
				'onFetchUserError'
			),
		onFetchUserSuccess: ({ result }) => state =>
			result,
		onFetchUserError: ({ error }) =>
			console.error(error),
	},
}


// View
const view = (state, actions) =>
	div({
		oncreate: () => actions._user.fetchUser(),
	}, [
		Toolbar(state, actions),
		//Sidebar.view(state, actions),
		main({ class: 'with-fixed-toolbar' }, [
			//Switch({},
				...routes.map(
					({ parent, path, view }) =>
						Route({
							parent,
							path,
							render: ({ match }) => Page(view, state, actions, match)
						})
				)
			//),
		]),
	])

const Page = (view, state, actions, match) =>
	div([
		Sidebar.view(state, actions, match),
		main({ class: 'with-fixed-toolbar' }, [
			view(state, actions, match),
		]),
	])

// Start
const epic_stories = withFx({
	fetchJson: makeFetchJson(),
	go: makeGo(),
}) (app) (state, actions, view, document.body)
location.subscribe(epic_stories.location)
