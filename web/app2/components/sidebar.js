import {
	div,
	nav,
	h3,
	h4,
	ul,
	li,
	button,
	img,
} from '@hyperapp/html'
import { Link } from '@hyperapp/router'
import { Enter, Exit } from '@hyperapp/transitions'


const state = {
	is_open: false,
}

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
}

const view = (state, actions) =>
	(state.sidebar.is_open
		? Active(state, actions)
		: Inactive()
	)

const Inactive = () =>
	div({ key: 'sidebar-container' })

const Active = (state, actions) =>
	div({ key: 'sidebar-container'}, [
		Sidebar(state, actions),
		Overlay(state, actions),
	])

const sidebar_animate ={
	time: 300,
	easing: 'ease-in-out',
	css: {
		'margin-left': '-250px'
	}
}

const Sidebar = (state, actions) =>
	Enter(sidebar_animate, 
		Exit(sidebar_animate, [
			nav({ class: 'sidebar active', key: 'sidebar' }, [
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

export default {
	state,
	actions,
	view,
}