import { article, h4, span, div, label, input, section, button } from '@hyperapp/html'
import { Link } from '@hyperapp/router'
import { action } from '@hyperapp/fx'

import { postJson, fetchJson } from 'App/fx'
import { parseDate } from 'App/date'
import { Notifications } from 'App/components'


// State

const state = {
	alerts: [],
	story: {},
	new_chapter: null,
}


// Actions

const actions = {
	clearState: () =>
		({
			story: {},
			alerts: [],
			new_chapter: null,
		}),
	enableNewChapter: state =>
		({
			...state,
			new_chapter: {
				title: '',
			},
		}),
	onInputTitle: value => state =>
		({
			...state,
			new_chapter: {
				...state.new_chapter,
				title: value,
			},
		}),
	cancel: state =>
		({
			...state,
			new_chapter: null,
		}),
	save: () => ({ new_chapter, story }) =>
		postJson(
			`/api/stories/${story._id}/chapters`,
			'onSaveChapterSuccess',
			'onApiError',
			new_chapter,
		),
	init: story_id =>
		[
			action('clearState'),
			action('fetchStory', story_id),
		],
	// HTTP
	fetchStory: story_id =>
		fetchJson(
			`/api/stories/${story_id}`,
			'onFetchStorySuccess',
			'onApiError'
		),
	onFetchStorySuccess: ({ result }) => state =>
		({
			...state,
			story: result,
			new_chapter: null,
		}),
	onSaveChapterSuccess: ({ result }) => state =>
		action('fetchStory', state.story._id),
	onApiError: ({ error }) => state =>
		({
			...state,
			alerts: [
				...state.alerts,
				{ message: error, type: 'error' }
			]
		}),
}

// View

const view = (state, actions, matcher) =>
	article({
		key: 'story-chapters',
		oncreate: () => {
			actions.story.setActive('chapters')
			actions.story.chapters.init(matcher.params.story_id)
		},
		ondestroy: () => actions.story.chapters.clearState(),
	},
	state.story.chapters.story
		? Chapters(state.story.chapters, actions.story.chapters)
		: Empty()
	)

const Chapters = ({ story, alerts, new_chapter }, actions) =>
	[
		Notifications(alerts),
		article({ class: 'chapter-container mb-10' },
			(story.chapters || []).map(
				x => Chapter({ ...x, story_id: story._id })
			)
		),
		new_chapter
			? NewChapter.Active(new_chapter, actions)
			: NewChapter.Inactive(actions),
	]

const Chapter = ({ story_id, id, title, _latest }) =>
	Link({
		class: 'chapter',
		to: `/stories/${story_id}/chapters/${id}/posts`
	}, [
		h4({ class: 'chapter-title' }, `${id}. ${title}`),
		LatestPost(_latest)
	])

const LatestPost = ({ _id, author, created_on }={}) =>
	(_id
		? span({ class: 'link-to-latest' }, `Latest post by ${author}, ${parseDate(new Date(created_on))}.`)
		: null
	)

const Empty = () => []

const NewChapter = {}

NewChapter.Active = ({ title }, { onInputTitle, cancel, save }) =>
	section([
		div({ class: 'form-group' }, [
			label('Title'),
			input({
				type: 'text',
				value: title,
				oninput: ev => onInputTitle(ev.target.value),
			})
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
		]),
	])

NewChapter.Inactive = ({ enableNewChapter }) =>
	section({ class: 'button-container' }, [
		button({
			class: 'btn primary',
			onclick: () => enableNewChapter(),
		}, 'New chapter'),
	])

// Export

export default {
	state,
	actions,
	view,
}