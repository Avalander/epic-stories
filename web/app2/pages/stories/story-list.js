import { div, h4, button, article, span, label, input } from '@hyperapp/html'
import { Link } from '@hyperapp/router'

import { fetchJson, postJson, go } from 'App/fx'
import { parseDate } from 'App/date'
import { Notifications } from 'App/components'


// State

const state = {
	new_story: null,
	stories: [],
	alerts: [],
}


// Actions

const actions = {
	enableNew: () => state =>
		({
			...state,
			new_story: {
				title: '',
			},
		}),
	onInputTitle: value => state =>
		({
			...state,
			new_story: {
				...state.new_story,
				title: value,
			},
		}),
	cancel: () => state =>
		({
			...state,
			new_story: null,
		}),
	save: () => ({ new_story }) =>
		postJson(
			'/api/stories',
			'onSaveSuccess',
			'onApiError',
			new_story
		),
	// HTTP
	onSaveSuccess: ({ data }) =>
		go(`/stories/${data._id}`),
	onApiError: ({ error }) => state =>
		({
			...state,
			alerts: [
				...state.alerts,
				{ message: error.message, type: 'error' }
			],
		}),
	fetchStories: () =>
		fetchJson(
			'/api/stories',
			'onFetchSuccess',
			'onApiError'
		),
	onFetchSuccess: ({ result }) => state =>
		({
			...state,
			stories: sortByLatestPost(result),
		}),
}

const sortByLatestPost = stories => {
	stories.sort(
		(a, b) =>
			(b._latest.created_on || 0) - (a._latest.created_on || 0)
	)
	return stories
}


// View

const view = (state, actions) =>
	article({
		key: 'story-list',
		class: 'content',
		oncreate: () => actions.story_list.fetchStories(),
	}, [
		Notifications(state.story_list.alerts),
		...state.story_list.stories.map(Story),
		state.story_list.new_story
			? Active(state.story_list.new_story, actions.story_list)
			: Inactive(state.story_list, actions.story_list),
	])

const Story = ({ title, _id, _latest }) =>
	div({ class: 'panel story'}, [
		div({ class: 'story-header' }, [
			h4(title),
			LatestPost({ ..._latest, _id }),
		]),
		Link({
			class: 'btn join',
			to: `/stories/${_id}/chapters`,
		}, 'View'),
	])

const LatestPost = ({ _id, author, created_on, chapter_id }) =>
	(created_on
		? Link({
			class: 'link-to-latest',
			to: `/stories/${_id}/chapters/${chapter_id}/posts`,
		}, `Latest post by ${author}, ${parseDate(new Date(created_on))}`)
		: null
	)

const Inactive = (state, { enableNew }) =>
	div({ class: 'new-story panel primary', onclick: enableNew }, [
		span({ class: 'handwriting' }, 'Start a new story.'),
	])

const Active = ({ title }, { onInputTitle, save, cancel }) =>
	div({ class: 'phantom-panel m-10' }, [
		div({ class: 'form-group' }, [
			label('Title'),
			input({
				type: 'text',
				value: title,
				oninput: ev => onInputTitle(ev.target.value),
			}),
		]),
		div({ class: 'button-container' }, [
			button({
				class: 'btn',
				onclick: () => cancel(),
			}, 'Cancel'),
			button({
				class: 'btn primary',
				onclick: () => save(),
			}, 'Save'),
		])
	])

export default {
	state,
	actions,
	view,
}
