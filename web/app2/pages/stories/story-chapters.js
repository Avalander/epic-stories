import { article, h4, span, div, label, input, section, button } from '@hyperapp/html'
import { Link } from '@hyperapp/router'
import { action } from '@hyperapp/fx'

import { postJson } from 'App/fx'
import { parseDate } from 'App/date'
import { Notifications } from 'App/components'

import StoryHeader from './_story-header'
import makeFetchStory from './_story-fetch'


// State

const state = {
	story: null,
	alerts: [],
	new_chapter: null,
}


// Actions

const actions = {
	...makeFetchStory(),
	cleanState: state =>
		({
			story: null,
			alerts: [],
			new_chapter: null,
		}),
	onCreate: story_id => [
		action('cleanState'),
		action('fetchStory', story_id),
	],
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
	onCancel: state =>
		({
			...state,
			new_chapter: null,
		}),
	onSave: () => ({ story, new_chapter }) =>
		postJson(
			`/api/stories/${story._id}/chapters`,
			'onSaveChapterSuccess',
			'onApiError',
			new_chapter,
		),
	// HTTP
	onSaveChapterSuccess: () => state =>
		action('onCreate', state.story._id),
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
		class: 'content',
		oncreate: () => actions.story_chapters.onCreate(matcher.params.story_id),
		ondestroy: () => actions.story_chapters.cleanState(),
	},
	state.story_chapters.story
		? Chapters(state.story_chapters, actions.story_chapters)
		: Empty()
	)

const Chapters = ({ story, alerts, new_chapter }, actions) =>
	[
		StoryHeader({ ...story, active: 'chapters' }),
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

NewChapter.Active = ({ title }, { onInputTitle, onCancel, onSave }) =>
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
				onclick: () => onCancel(),
			}, 'Cancel'),
			button({
				class: 'btn primary',
				onclick: () => onSave(),
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