import {
	div,
	nav,
	h3,
	ul,
	li,
	button,
	img,
} from '@hyperapp/html'
import { Link } from '@hyperapp/router'


const S = {
	show: {
		active: true,
		overlay: true,
	},
	hide: {
		active: false,
		overlay: true,
	},
	remove_overlay: {
		active: false,
		overlay: false,
	},
}

const state = {
	active: false,
	username: 'batman',
}

const actions = {

}

const view = (state, actions) =>
	div([
		nav({ class: `sidebar${state.sidebar.active ? ' active' : ''}` }, [
			div([
				button({
					class: 'dismiss fa fa-arrow-left',
					onclick: () => {},
				}),
				div({ class: 'sidebar-header' }, [
					img({
						class: 'avatar',
						src: `/api/avatars/${state.sidebar.username}`
					}),
					h3(state.sidebar.username),
				]),
			])
		])
	])

export default {
	state,
	actions,
	view,
}