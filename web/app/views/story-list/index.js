import './story-list.scss'

import xs from 'xstream'

import {
	a,
	div,
	h4,
	span,
	button,
} from '@cycle/dom'

import CreateNewStory from './create-new-story'


const displayErrors = errors =>
	div('.alert-container', errors.map(({ message }) => div('.alert-error', message)))

const displayStories = stories => stories.map(({ title }) => div('.panel.story', [
	div('.story-header', h4(title)),
	button('.btn.join', { attrs: { href: '/' }}, 'Join'),
]))

const view = (stories$, errors$, create_new_story$) => xs.combine(stories$, errors$, create_new_story$)
	.map(([stories, errors, new_story]) =>
		div([
			displayErrors(errors),
			...displayStories(stories),
			new_story,
		])
	)

export default ({ DOM, HTTP }) => {
	const fetch_stories$ = HTTP.select('fetch-stories')
		.flatten()
		.map(res => res.body)
	
	const errors$ = fetch_stories$.filter(result => !result.ok)
		.map(({ error }) => [ error ])
		.startWith([])
	const stories$ = fetch_stories$.filter(result => result.ok)
		.map(({ result }) => result)
		.startWith([])

	const create_new_story = CreateNewStory({ DOM })
	
	const request$ = xs.of({
		url: '/api/stories',
		method: 'GET',
		withCredentials: true,
		category: 'fetch-stories',
	})

	return {
		DOM: view(stories$, errors$, create_new_story.DOM),
		HTTP: request$,
	}
}