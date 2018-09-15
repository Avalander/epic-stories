import {
	div,
	nav,
	h3,
	h4,
	ul,
	li,
	button,
	img,
	a,
} from '@hyperapp/html'
import { action } from '@hyperapp/fx'
import { Enter, Exit } from '@hyperapp/transitions'

import { fromNullable } from '@avalander/fun/src/maybe'

import { go, fetchJson } from 'App/fx'


// State

const state = {
	is_open: false,
	stories: []
}


// Actions

const actions = {
	open: () => state =>
		({
			...state,
			is_open: true,
		}),
	hide: () => state =>
		({
			...state,
			is_open: false,
		}),
	go: path =>
		[
			action('hide'),
			go(path),
		],
	fetchStories: () =>
		fetchJson(
			'/api/stories',
			'onFetchStoriesSuccess',
			'onFetchStoriesError'
		),
	onFetchStoriesSuccess: ({ result }) => state =>
		({
			...state,
			stories: sortByLatestPost(result),
		}),
	onFetchStoriesError: ({ error }) =>
		console.error(error),
}

const sortByLatestPost = stories => {
	stories.sort(
		(a, b) =>
			(b._latest.created_on || 0) - (a._latest.created_on || 0)
	)
	return stories
}


// View

const view = (state, actions, matcher) =>
	(state.sidebar.is_open
		? Active(state, actions, matcher)
		: Inactive()
	)

const Inactive = () =>
	div({ key: 'sidebar-container' })

const Active = (state, actions, matcher) =>
	div({ key: 'sidebar-container' }, [
		Sidebar(state, actions, matcher),
		Overlay(state, actions),
	])

const sidebar_animate ={
	time: 300,
	easing: 'ease-in-out',
	css: {
		'margin-left': '-250px'
	}
}

const Sidebar = (state, actions, matcher) =>
	Enter(sidebar_animate, 
		Exit(sidebar_animate, [
			nav({
				class: 'sidebar active',
				key: 'sidebar',
				oncreate: () => actions.sidebar.fetchStories(),
			}, [
				div([
					button({
						class: 'dismiss fa fa-arrow-left',
						onclick: () => actions.sidebar.hide(),
					}),
					div({ class: 'sidebar-header' }, [
						img({
							class: 'avatar',
							src: `/api/avatars/${state._user.username}`
						}),
						Username(state._user),
					]),
					ul({ class: 'components' }, [
						MenuLink({
							class: 'border-bottom',
							onclick: () => actions.sidebar.go('/stories'),
						}, 'All Stories'),
						StoryList(state, actions, matcher),
						MenuLink({
							class: 'border-top',
							onclick: () => actions.sidebar.go('/preferences'),
						}, 'Preferences'),
					]),
				])
			])
		])
	)

const Username = ({ display_name, username }) =>
	div({ class: 'username' }, [
		h3(display_name || username),
		display_name
			? h4(`(${username})`)
			: null,
	])

const MenuLink = (props, children) =>
	li([
		a({
			...props,
		}, children),
	])

const StoryList = (state, actions, matcher) =>
	fromNullable(matcher.params)
		.chain(params =>
			fromNullable(params.story_id)
		)
		.chain(id =>
			fromNullable(
				state.sidebar.stories.find(
					({ _id }) => _id === id
				)
			)
		)
		.map(story => [
			StoryMenu(story, actions),
			...state.sidebar.stories
				.filter(
					({ _id }) => _id !== story._id
				)
				.map(
					x => StoryHeader(x, actions)
				)
		])
		.fold(
			() => state.sidebar.stories
				.map(
					x => StoryHeader(x, actions)
				),
			x => x
		)

const StoryMenu = ({ _id, title }, actions) =>
	[
		MenuLink({
			onclick: () => actions.sidebar.go(`/stories/${_id}/chapters`)
		}, title),
		MenuLink({
			class: 'subcomponent',
			onclick: () => actions.sidebar.go(`/stories/${_id}/chapters`)
		}, 'Chapters'),
		MenuLink({
			class: 'subcomponent',
			onclick: () => actions.sidebar.go(`/stories/${_id}/characters`)
		}, 'Characters'),
		MenuLink({
			class: 'subcomponent',
			onclick: () => actions.sidebar.go(`/stories/${_id}/my-character`)
		}, 'My Character'),
	]
	
const StoryHeader = ({ _id, title }, actions) =>
		MenuLink({
			onclick: () => actions.sidebar.go(`/stories/${_id}/chapters`)
		}, title)

const overlay_animate = {
	time: 500,
	easing: 'ease-in-out',
	css: {
		opacity: '0',
	},
}

const Overlay = (state, actions) =>
	Enter(overlay_animate, 
		Exit(overlay_animate, [
			div({
				key: 'sidebar-overlay',
				class: 'overlay',
				onclick: () => actions.sidebar.hide(),
			})
		])
	)


// Exports

export default {
	state,
	actions,
	view,
}