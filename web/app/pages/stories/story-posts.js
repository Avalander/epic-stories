import { article, div, button, section, img, i, span, h4, textarea, a } from '@hyperapp/html'
import { action } from '@hyperapp/fx'

import { fromNullable } from '@avalander/fun/src/maybe'

import { fetchJson, postJson } from 'App/fx'
import { Notifications, Markdown } from 'App/components'

import { parseDate } from 'App/date'


// State

const state = {
	alerts: [],
	story: {},
	user: {},
	posts: [],
	new_post: {},
}


// Actions

const actions = {
	onApiError: ({ error }) => state =>
		({
			...state,
			alerts: [
				...state.alerts,
				{ message: error.message, type: 'error' }
			],
		}),
	// Fetch user
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
	// Fetch posts
	fetchPosts: ([ story_id, chapter_id ]) =>
		fetchJson(
			`/api/stories/${story_id}/chapters/${chapter_id}/posts`,
			'onFetchPostsSuccess',
			'onApiError'
		),
	onFetchPostsSuccess: ({ result }) => state =>
		({
			...state,
			posts: stashMetaPosts(result),
		}),
	// Init state
	clearState: () => state =>
		({
			alerts: [],
			story: [],
			posts: [],
			user: state.user,
			new_post: {},
		}),
	init: ([ story_id, chapter_id ]) =>
		[
			action('clearState'),
			action('fetchUser'),
			action('fetchPosts', [ story_id, chapter_id ]),
			action('setChapterId', chapter_id),
			action('setStoryId', story_id),
		],
	setChapterId: chapter_id => state =>
		({
			...state,
			chapter_id,
		}),
	setStoryId: story_id => state =>
		({
			...state,
			story_id,
		}),
	// Edit post
	editPost: post_id => state =>
		(post_id
			? [
				action('setNewPost', state.posts.find(
					({ _id }) => _id === post_id
				)),
				action('setPostOpen', true),
			]
			: [
				action('loadPostDraft'),
				action('setPostOpen', true),
			]
		),
	cancelEditPost: () =>
		[
			action('removePostDraft'),
			action('setNewPost', {}),
		],
	setNewPost: post => state =>
		({
			...state,
			new_post: post,
		}),
	updatePostText: text =>
		[
			action('setPostText', text),
			action('savePostDraft'),
		],
	setPostOpen: value => state =>
		({
			...state,
			new_post: {
				...state.new_post,
				is_open: value,
			}
		}),
	// Save draft
	savePostDraft: () => state =>
		localStorage.setItem(`posts-${state.user.username}-draft`, JSON.stringify(state.new_post)),
	removePostDraft: () => state =>
		localStorage.removeItem(`posts-${state.user.username}-draft`),
	loadPostDraft: () => state =>
		({
			...state,
			new_post: parsePostDraft(
				localStorage.getItem(`posts-${state.user.username}-draft`)
			),
		}),
	setPostText: text => state =>
		({
			...state,
			new_post: {
				...state.new_post,
				text,
			}
		}),
	// Save to backend
	savePost: type => state =>
		postJson(
			`/api/stories/${state.story_id}/chapters/${state.chapter_id}/posts`,
			'onSavePostSuccess',
			'onSavePostFailure',
			cleanPostState({ ...state.new_post, type })
		),
	onSavePostSuccess: ({ result }) => state =>
		[
			action('fetchPosts', [ state.story_id, state.chapter_id ]),
			action('cancelEditPost'),
		],
	onSavePostFailure: ({ error }) => state =>
		({
			...state,
			new_post: {
				...state.new_post,
				_alerts: [
					{ message: error.message, type: 'error' }
				]
			}
		}),
}

const parsePostDraft = data =>
	(data
		? JSON.parse(data)
		: {}
	)

const cleanPostState = ({ _alerts, _display_name, is_open, ...post }) =>
	post

const stashMetaPosts = posts =>
	posts.reduce(
		(prev, x) =>
			x.type === 'meta'
				? addMetaPost(prev, x)
				: [...prev, x],
		[]
	)

const addMetaPost = (prev, x) => {
	const last = prev[prev.length - 1]
	if (!last || last.type !== 'meta-group') {
		return [
			...prev,
			{
				type: 'meta-group',
				posts: [ x ],
			}
		]
	}
	last.posts = [ ...last.posts, x ]
	return [ ...prev ]
}


// View

const view = (state, actions, matcher) =>
	article({
		key: 'story-posts',
		oncreate: () => {
			actions.story.setActive('')
			actions.story.setSubtitle(getSubtitle(state.story.story, matcher.params.chapter_id))
			actions.story.posts.init([ matcher.params.story_id, matcher.params.chapter_id ])
		},
		ondestroy: () => {
			actions.story.setSubtitle(undefined)
			actions.story.posts.clearState()
		},
	}, [
		Notifications(state.story.posts.alerts),
		article({ class: 'post-list' },
			state.story.posts.posts.map(
				x => Post(x, state.story.posts.user, actions.story.posts)
			)
		),
		div({ class: 'button-container mt-10' }, [
			button({
				class: 'btn primary',
				onclick: () => actions.story.posts.editPost(),
			}, 'Reply'),
		]),
		EditPost(state.story.posts.new_post, actions.story.posts),
	])

const getSubtitle = (story, chapter_id) =>
	fromNullable(story)
		.chain(({ chapters }) => fromNullable(chapters))
		.map(chapters => chapters.find(
			({ id }) => id == chapter_id
		))
		.fold(
			() => undefined,
			({ id, title }) => `Chapter ${id}. ${title}`
		)

const Post = (post, user, actions) =>
	(post.type === 'meta-group'
		? MetaGroup(post, user, actions)
		: StoryPost(post, user, actions)
	)

const StoryPost = ({ author, _display_name, text, created_on, _id }, { username }, { editPost }) =>
	section({ class: 'post' }, [
		div({ class: 'post-header' }, [
			div([
				img({ class: 'avatar', src: `/api/avatars/${author}` }),
			]),
		]),
		div({ class: 'post-body' }, [
			div({ class: 'post-body-header' }, [
				div([
					span({ class: 'post-author mr-20' }, _display_name || author),
					span({ class: 'post-date mr-20' }, parseDate(new Date(created_on))),
				]),
				StoryPostButtons({ author, username, _id, editPost }),
			]),
			div({ class: 'post-text' }, Markdown(text)),
		])
	])

const StoryPostButtons = ({ author, username, _id, editPost }) =>
	div({ class: 'button-container' }, [
		author === username
			? button({
				class: 'btn',
				title: 'Edit this post',
				onclick: () => editPost(_id),
			}, [
				i({ class: 'fa fa-pencil mr-5' }),
				span({ class: 'hide-sm' }, 'Edit'),
			])
			: null
	])

const MetaGroup = (group, user) =>
	section({ class: 'meta-group' }, [
		div({ class: 'meta-title' }, [
			h4('Meta discussion'),
		]),
		...group.posts.map(MetaPost),
	])

const MetaPost = ({ author, _display_name, text }) =>
	div({ class: 'post meta' }, [
		div({ class: 'post-header' }, [
			div([
				span({ class: 'post-author' }, _display_name || author),
			]),
		]),
		div({ class: 'post-body' }, [
			div({ class: 'post-text text' }, [
				Markdown(text),
			]),
		]),
	])

const EditPost = ({ is_open, text, _id, created_on, _alerts=[] }, { savePost, cancelEditPost, updatePostText }) =>
	section([
		div({ class: `bottom-margin${is_open ? ' open' : ''}` }),
		div({ class: `edit-panel${is_open ? ' open' : ''}` }, [
			div({ class: 'content' }, [
				Notifications(_alerts),
				_id
					? span({ class: 'text-muted' }, `Editing post created on ${parseDate(new Date(created_on))}`)
					: [],
				div([
					span({ class: 'text-muted' }, 'This field supports markdown syntax. Check '),
					a({ class: 'link', href: 'https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet', target: '_blank' },
						'this link'
					),
					span({ class: 'text-muted' }, ' for more information.'),
				]),
				div({ class: 'form-group' }, [
					textarea({
						value: text,
						oninput: ev => updatePostText(ev.target.value),
					})
				]),
				div({ class: 'button-container' }, [
					button({
						class: 'btn',
						onclick: () => cancelEditPost(),
					}, 'Cancel'),
					button({
						class: 'btn',
						onclick: () => savePost('meta'),
					}, 'Post meta'),
					button({
						class: 'btn primary',
						onclick: () => savePost('regular'),
					}, 'Post')
				]),
			])
		])
	])

// Exports

export default {
	state,
	actions,
	view,
}
