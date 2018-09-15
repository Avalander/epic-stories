import { article, div, span, button, label, h1, p, input } from '@hyperapp/html'
import { action } from '@hyperapp/fx'

import { fetchJson, postJson } from 'App/fx'
import { Notifications } from 'App/components'


// State

const state = {
	alerts: [],
	user: {},
}


// Actions

const actions = {
	setDisplayName: value => state =>
		({
			...state,
			display_name: value,
		}),
	// Fetch user
	onApiError: ({ error }) => state =>
		({
			...state,
			alerts: [
				...state.alerts,
				{ message: error.message, type: 'error' }
			],
		}),
	fetchUser: () =>
		fetchJson(
			'/api/user',
			'onFetchUserSuccess',
			'onApiError'
		),
	onFetchUserSuccess: ({ result }) => state =>
		({
			...state,
			user: result,
		}),
	// Preferences
	fetchPreferences: () =>
		fetchJson(
			'/api/user/preferences',
			'onFetchPreferencesSuccess',
			'onApiError'
		),
	onFetchPreferencesSuccess: ({ result }) => state =>
		({
			...state,
			display_name: result.display_name,
		}),
	savePreferences: () => state =>
		postJson(
			'/api/user/preferences',
			'onSavePreferencesSuccess',
			'onApiError',
			{ display_name: state.display_name }
		),
	onSavePreferencesSuccess: ({ result }) => state =>
		({
			...state,
			alerts: [
				{ message: 'Preferences udpated successfully.', type: 'success' }
			]
		}),
	// Init
	clearState: () => state =>
		({
			alerts: [],
			user: state.user,
		}),
	init: () =>
		[
			action('clearState'),
			action('fetchUser'),
			action('fetchPreferences'),
		],
}


// View

const view = (state, actions, matcher) =>
	article({
		key: 'preferences',
		class: 'content',
		oncreate: () => actions.preferences.init(),
	}, [
		h1({ class: 'page-title' }, 'Preferences'),
		Notifications(state.preferences.alerts),
		div({ class: 'form-group' }, [
			label('Username'),
			p(state.preferences.user.username),
		]),
		div({ class: 'form-group' }, [
			label('Display Name'),
			span({ class: 'text-description' },
				'A name that will be displayed instead of your username. Leave blank to display your username.'
			),
			input({
				type: 'text',
				value: state.preferences.display_name,
				oninput: ev => actions.preferences.setDisplayName(ev.target.value),
			}),
		]),
		div({ class: 'button-container' }, [
			button({
				class: 'btn primary',
				onclick: () => actions.preferences.savePreferences(),
			}, 'Save'),
		]),
	])


// Exports

export default {
	state,
	actions,
	view,
}