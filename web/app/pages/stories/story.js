import { article, header, h1, h2, div } from '@hyperapp/html'
import { Link, Route, Switch } from '@hyperapp/router'

import { fetchJson } from 'App/fx'

import StoryChapters from './story-chapters'
import StoryCharacters from './story-characters'
import StoryMyCharacter from './story-my-character'
import StoryPosts from './story-posts'


// State

const state = {
	story: {},
	chapters: StoryChapters.state,
	characters: StoryCharacters.state,
	my_character: StoryMyCharacter.state,
	posts: StoryPosts.state,
	_subtitle: '',
	_active: '',
}


// Actions

const actions = {
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
		}),
	onApiError: ({ error }) =>
		console.error(error),
	setActive: value => state =>
		({
			...state,
			_active: value,
		}),
	setSubtitle: value => state =>
		({
			...state,
			_subtitle: value,
		}),
	clearState: () => state =>
		({
			...state,
			story: {},
			_subtitle: '',
			_active: '',
		}),
	chapters: StoryChapters.actions,
	characters: StoryCharacters.actions,
	my_character: StoryMyCharacter.actions,
	posts: StoryPosts.actions,
}


// View

const view = (state, actions, match) =>
	article({
		key: `story-${match.params.story_id}`,
		class: 'content',
		oncreate: () => actions.story.fetchStory(match.params.story_id),
		ondestroy: () => actions.story.clearState(),
	}, hasRightStory(state.story.story, match.params.story_id)
		? [
			StoryHeader({ ...state.story.story, active: state.story._active, subtitle: state.story._subtitle }),
			StoryBody(state, actions, match),
		]
		: [])

const hasRightStory = (story, story_id) =>
	story && story._id === story_id

const StoryHeader = ({ _id, title, subtitle, active }) =>
	header({ class: 'story-header', key: 'story-header' }, [
		h1(title),
		subtitle
			? h2(subtitle)
			: null,
		div({ class: 'tab-container hide-sm' }, [
			HeaderLink('Chapters', `/stories/${_id}/chapters`, active === 'chapters'),
			HeaderLink('Characters', `/stories/${_id}/characters`, active === 'characters'),
			HeaderLink('My Character', `/stories/${_id}/my-character`, active === 'my-character'),
		])
	])

const StoryBody = (state, actions, match) =>
	Switch({}, [
		Route({
			parent: true,
			path: `${match.path}/chapters/:chapter_id/posts`,
			render: ({ match }) => StoryPosts.view(state, actions, match),
		}),
		Route({
			parent: true,
			path: `${match.path}/chapters`,
			render: ({ match }) => StoryChapters.view(state, actions, match),
		}),
		Route({
			parent: true,
			path: `${match.path}/characters`,
			render: ({ match }) => StoryCharacters.view(state, actions, match),
		}),
		Route({
			parent: true,
			path: `${match.path}/my-character`,
			render: ({ match }) => StoryMyCharacter.view(state, actions, match),
		}),
	])

const HeaderLink = (title, to, is_active) =>
	Link({
		class: `header-link${is_active ? ' active' : ''}`,
		to: !is_active ? to : undefined,
	}, title)


// Exports

export default {
	state,
	actions,
	view,
}