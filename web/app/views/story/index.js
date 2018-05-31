import './story.scss'

import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

import {
	article,
	div,
	h1,
	button,
} from '@cycle/dom'

import { renderErrors } from 'app/render'
import {
	makeFetch,
	makePost,
} from 'app/http'

import { timestampToDate } from 'app/date'

import StoryHeader from './header'
import EditPost from './edit-post'
import renderPost from './render-post'


const Story = ({ DOM, HTTP, IDB, cache, story_id$, chapter_id$ }) => {
	const fetch_user = makeFetch(HTTP, 'fetch-user', xs.of('/api/user'))
	const user$ = fetch_user.response$

	const {
		save_post,
		fetch_posts,
		fetch_story,
		api_errors,
	} = chapter_id$ ? makeHttpChapterComponents(HTTP, story_id$, chapter_id$) : makeHttpStoryComponents(HTTP, story_id$)

	const open$ = DOM.select('[data-action="reply"]').events('click')
		.mapTo(true)
		.startWith(false)
	const edit_click$ = DOM.select('[data-action="edit"]').events('click')
		.map(ev => ev.target.tagName === 'BUTTON' ? ev.target : ev.target.parentElement)
		.map(target => target.dataset.post)
	const edit_post$ = edit_click$.compose(sampleCombine(fetch_posts.response$))
		.map(([ id, posts ]) => posts.find(x => x._id === id))

	const edit_post = EditPost({ DOM, IDB, open$, edit_post$, save_post, user$ })

	const posts$ = fetch_posts.response$
		.map(x => x.map(timestampToDate))
		.map(stashMetaPosts)

	const story$ = fetch_story.response$

	const story_header = StoryHeader({ DOM, story$,
		active$: xs.of('none'),
		subtitle$: chapter_id$
			? xs.combine(chapter_id$, story$)
				.map(([ chapter_id, { chapters }]) => chapters.find(({ id }) => id == chapter_id))
				.map(({ id, title }) => `Chapter ${id}: ${title}`)
			: xs.of(null)
	})

	const save_post_request$ = save_post.makeRequest(edit_post.post$)
	
	return {
		DOM: view(story_header.DOM, story$, posts$, edit_post.DOM, user$, api_errors),
		HTTP: xs.merge(fetch_posts.request$, fetch_story.request$, save_post_request$, fetch_user.request$),
		IDB: edit_post.IDB,
		router: story_header.router,
	}
}

const apiErrors = (fetch_posts, fetch_story, save_post) => ({
	fetch_posts$: xs.merge(requestErrors(fetch_posts), requestErrors(fetch_story)),
	save_post$: requestErrors(save_post),
})

const requestErrors = ({ error$, response$ }) => xs.merge(
	error$.map(error => [ error ]),
	response$.map(() => [])
)
.startWith([])

const view = (header$, story$, posts$, new_post$, user$, api_errors) => xs.combine(header$, story$, posts$, new_post$, user$, api_errors.fetch_posts$)
	.map(([ story_header, story, posts, new_post, user, fetch_errors ]) => article('.content', [
		story_header,
		renderErrors(fetch_errors),
		div('.post-list', posts.map(x => renderPost(x, user))),
		div('.button-container.mt-10', [
			button('.btn.primary', { dataset: { action: 'reply' }}, 'Reply'),
		]),
		new_post,
	]))

const stashMetaPosts = posts => posts.reduce((prev, x) => x.type === 'meta'
	? addMetaPost(prev, x)
	: [...prev, x], [])

const addMetaPost = (prev, x) => {
	const last = prev[prev.length - 1]
	if (!last || last.type !== 'meta-group') return [ ...prev, {
		type: 'meta-group',
		posts: [ x ],
	}]
	last.posts = [ ...last.posts, x ]
	return [ ...prev ]
}

// Wow, such hack, much regret later...
const makeHttpChapterComponents = (HTTP, story_id$, chapter_id$) => {
	const posts_url$ = xs.combine(story_id$, chapter_id$)
		.map(([ story_id, chapter_id ]) => `/api/stories/${story_id}/chapters/${chapter_id}/posts`)
	const save_post = makePost(HTTP, 'save-post', posts_url$)
	const fetch_posts = makeFetch(HTTP, 'fetch-posts', 
		xs.combine(posts_url$, save_post.response$.startWith(true))
			.map(([ url ]) => url)
	)
	const fetch_story = makeFetch(HTTP, 'fetch-story',
		story_id$.map(story_id => `/api/stories/${story_id}`)
	)
	const api_errors = apiErrors(fetch_posts, fetch_story, save_post)

	return {
		save_post,
		fetch_posts,
		fetch_story,
		api_errors,
	}
}

const makeHttpStoryComponents = (HTTP, story_id$) => {
	const save_post = makePost(HTTP, 'save-post',
		story_id$.map(story_id => `/api/stories/${story_id}/posts`)
	)
	const fetch_posts = makeFetch(HTTP, 'fetch-posts', 
		xs.combine(story_id$, save_post.response$.startWith(true))
			.map(([ story_id ]) => `/api/stories/${story_id}/posts`)
	)
	const fetch_story = makeFetch(HTTP, 'fetch-story',
		story_id$.map(story_id => `/api/stories/${story_id}`)
	)
	const api_errors = apiErrors(fetch_posts, fetch_story, save_post)

	return {
		save_post,
		fetch_posts,
		fetch_story,
		api_errors,
	}
}

export default Story
