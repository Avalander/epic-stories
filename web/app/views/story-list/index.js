import './story-list.scss'

import xs from 'xstream'

import {
	a,
	div,
	h4,
	span,
	button,
} from '@cycle/dom'

import { renderErrors } from 'app/render'
import {
	makeFetch,
	makePost,
} from 'app/http'

import { parseDate } from 'app/date'

import CreateNewStory from './create-new-story'


export default ({ DOM, HTTP }) => {
	const save_story = makePost(HTTP, 'save-story', xs.of('/api/stories'))
	const fetch_stories = makeFetch(HTTP, 'fetch-stories',
		save_story.response$.startWith(true).mapTo('/api/stories'))
	
	const errors$ = xs.merge(fetch_stories.error$, save_story.error$)
		.map(e => [ e ])
		.startWith([])

	const stories$ = fetch_stories.response$
		.startWith([])
		.map(sortByLatestPost)
	
	const route$ = DOM.select('[data-href]').events('click')
		.map(ev => ev.target.dataset.href)

	const create_new_story = CreateNewStory({ DOM, clear$: save_story.response$.mapTo(true) })

	const save_story_request$ = save_story.makeRequest(create_new_story.new_story$)

	const request$ = xs.merge(fetch_stories.request$, save_story_request$)

	return {
		DOM: view(stories$, errors$, create_new_story.DOM),
		HTTP: request$,
		router: route$,
	}
}

const sortByLatestPost = stories => {
	const result = [...stories]
	result.sort((a, b) => (b._latest.created_on || 0) - (a._latest.created_on || 0))
	return result
}

const displayStories = stories => stories.map(({ title, _id, is_playing, _latest }) => div('.panel.story', [
	div('.story-header', [
		h4(title),
		latestPost({ ..._latest, _id }),
	]),
	is_playing
		? button('.btn.join', { dataset: { href: `/stories/${_id}` }}, 'View')
		: button('.btn.join', { dataset: { href: `/stories/${_id}/my-character` }}, 'Join'),
]))

const latestPost = ({ _id, author, created_on, chapter_id }) => created_on
	? a('.link-to-latest', { dataset: {
		href: chapter_id ? `/stories/${_id}/chapters/${chapter_id}/posts` : `/stories/${_id}`
	}}, `Latest post on ${parseDate(new Date(created_on))} by ${author}`)
	: null

const view = (stories$, errors$, create_new_story$) => xs.combine(stories$, errors$, create_new_story$)
	.map(([stories, errors, new_story]) =>
		div('.content', [
			renderErrors(errors),
			...displayStories(stories),
			new_story,
		])
	)
