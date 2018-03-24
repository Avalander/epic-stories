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
import CreateNewStory from './create-new-story'


const displayStories = stories => stories.map(({ title, _id, is_playing }) => div('.panel.story', [
	div('.story-header', h4(title)),
	is_playing
		? button('.btn.join', { dataset: { href: `/stories/${_id}` }}, 'View')
		: button('.btn.join', { dataset: { href: `/stories/${_id}/my-character` }}, 'Join'),
]))

const view = (stories$, errors$, create_new_story$) => xs.combine(stories$, errors$, create_new_story$)
	.map(([stories, errors, new_story]) =>
		div([
			renderErrors(errors),
			...displayStories(stories),
			new_story,
		])
	)

const response = (HTTP, category) => {
	const response$ = HTTP.select(category)
		.flatten()
		.map(res => res.body)
	
	const error$ = response$
		.filter(res => !res.ok)
		.map(res => res.error)
	const success$ = response$
		.filter(res => res.ok)
		.map(res => res.result)
	
	return {
		error$,
		success$,
	}
}

export default ({ DOM, HTTP }) => {
	const fetch_stories = response(HTTP, 'fetch-stories')
	const save_story = response(HTTP, 'save-story')
	
	const errors$ = xs.merge(fetch_stories.error$, save_story.error$)
		.map(e => [ e ])
		.startWith([])

	const stories$ = fetch_stories.success$
		.startWith([])
	
	const route$ = DOM.select('[data-href]').events('click')
		.map(ev => ev.target.dataset.href)

	const create_new_story = CreateNewStory({ DOM, clear$: save_story.success$.mapTo(true) })

	const save_story_request$ = create_new_story.new_story$
		.map(story => ({
			url: '/api/stories',
			method: 'POST',
			withCredentials: true,
			category: 'save-story',
			send: story,
		}))
	
	const fetch_stories_request$ = save_story.success$
		.startWith(true)
		.mapTo({
			url: '/api/stories',
			method: 'GET',
			withCredentials: true,
			category: 'fetch-stories',
		})

	const request$ = xs.merge(fetch_stories_request$, save_story_request$)

	return {
		DOM: view(stories$, errors$, create_new_story.DOM),
		HTTP: request$,
		router: route$,
	}
}