import './story-chapters.scss'

import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

import {
	a,
	div,
	header,
	h1,
	span,
	button,
	input,
} from '@cycle/dom'

import { renderErrors } from 'app/render'
import {
	makeFetch,
	makePost,
} from 'app/http'

import StoryHeader from '../header'
import CreateNewChapter from './create-new-chapter'


export default ({ DOM, HTTP, story_id$ }) => {
	const link_click$ = DOM.select('[data-id]').events('click')
		.map(ev => ev.target.dataset.id)
	const route$ = link_click$.compose(sampleCombine(story_id$))
		.map(([ chapter_id, story_id ]) => `/stories/${story_id}/chapters/${chapter_id}/posts`)

	const save_chapter = makePost(HTTP, 'save-chapter',
		story_id$.map(story_id => `/api/stories/${story_id}/chapters`)
	)
	const fetch_story = makeFetch(HTTP, 'fetch-story',
		xs.combine(story_id$, save_chapter.response$.startWith(true))
			.map(([ story_id ]) => `/api/stories/${story_id}`)
	)

	const story$ = fetch_story.response$
	
	const story_header = StoryHeader({ DOM, story$, active$: xs.of('chapters') })
	const new_chapter = CreateNewChapter({ DOM, story$, clear$: save_chapter.response$ })

	const request_errors$ = xs.merge(
		fetch_story.error$,
		save_chapter.error$,
	)
	.map(e => [ e ])
	const reset_errors$ = new_chapter.save$.mapTo([])

	const errors$ = xs.merge(request_errors$, reset_errors$)
		.startWith([])

	const request$ = xs.merge(
		fetch_story.request$,
		save_chapter.makeRequest(new_chapter.save$),
	)

	return {
		HTTP: request$,
		DOM: view(story$, errors$, story_header.DOM, new_chapter.DOM),
		router: xs.merge(story_header.router, route$),
	}
}

const view = (story$, errors$, story_header$, new_chapter$) => xs.combine(story$, errors$, story_header$, new_chapter$)
	.map(([ story, errors, story_header, new_chapter ]) =>
		div('.content', [
			story_header,
			renderErrors(errors),
			renderChapters(story),
			new_chapter,
		])
	)

const renderHeader = ({ title }) =>
	header('.story-header', [
		h1(title),
	])

const renderChapters = ({ chapters=[] }) =>
	div('.chapter-container.mb-10', chapters.map(renderChapter))

const renderChapter = ({ id, title }) =>
	div('.chapter', [
		a('.chapter-title', { dataset: { id: `${id}` }}, `${id}. ${title}`),
		//a('Last post'),
	])
