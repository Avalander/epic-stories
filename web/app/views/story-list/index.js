import './story-list.scss'

import xs from 'xstream'

import {
	div,
	h4,
	span,
	button,
} from '@cycle/dom'

import CreateNewStory from './create-new-story'


const view = (stories$, create_new_story$) => xs.combine(stories$, create_new_story$)
	.map(([stories, new_story]) =>
		div([
			...stories.map(({ title }) => div('.panel.story', [
				div('.story-header', h4(title)),
				button('.btn.join', 'Join'),
			])),
			new_story,
		])
	)

export default ({ DOM, HTTP }) => {
	const fetch_stories$ = HTTP.select('fetch-stories')
		.flatten()
		.map(res => res.body)
		.startWith([{ title: 'Sagan om ringen' }, { title: 'The three brothers' }])
	
	const create_new_story = CreateNewStory({ DOM })
	
	return {
		DOM: view(fetch_stories$, create_new_story.DOM),
	}
}