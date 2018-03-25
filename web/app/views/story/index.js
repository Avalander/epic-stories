import './story.scss'

import xs from 'xstream'

import {
	article,
	div,
	span,
	p,
	h1,
	img,
} from '@cycle/dom'

import { renderErrors } from 'app/render'

import NewPost from './new-post'

import pinkie from 'app/pinkie.png'


const Story = ({ DOM, HTTP, story_id$ }) => {
	const fetch_posts_response$ = HTTP.select('fetch-posts').flatten()
		.map(res => res.body)
	const fetch_story_response$ = HTTP.select('fetch-story').flatten()
		.map(res => res.body)
	const save_post_response$ = HTTP.select('save-post').flatten()
		.map(res => res.body)
	const save_post_success$ = save_post_response$
		.filter(res => res.ok)
		.map(res => res.result)
	const api_errors = apiErrors(fetch_posts_response$, fetch_story_response$, save_post_response$)

	const new_post = NewPost({ DOM, clear$: save_post_success$ })

	const posts$ = fetch_posts_response$
		.filter(res => res.ok)
		.map(res => res.result)
		.map(x => x.map(timestampToDate))
		.startWith([])
	
	const story$ = fetch_story_response$
		.filter(res => res.ok)
		.map(res => res.result)

	const save_post_request$ = xs.combine(story_id$, new_post.new_post$)
		.map(([ story_id, post ]) => ({
			url: `/api/stories/${story_id}/posts`,
			method: 'POST',
			withCredentials: true,
			category: 'save-post',
			send: post,
		}))

	const fetch_posts_request$ = xs.combine(story_id$, save_post_success$.startWith(true))
		.map(([ story_id ]) => ({
			url: `/api/stories/${story_id}/posts`,
			method: 'GET',
			withCredentials: true,
			category: 'fetch-posts',
		}))
	
	const fetch_story_request$ = story_id$.map(story_id => ({
		url: `/api/stories/${story_id}`,
		method: 'GET',
		withCredentials: true,
		category: 'fetch-story',
	}))
	
	return {
		DOM: view(story$, posts$, new_post.DOM, api_errors),
		HTTP: xs.merge(fetch_posts_request$, fetch_story_request$, save_post_request$),
	}
}

const timestampToDate = post => {
	const date = new Date(post.created_on)
	return {
		...post,
		created_on: `${date.toDateString()} - ${date.toTimeString()}`
			.replace(/GMT.*/g, '')
			.substring(0, 23)
	}
}

const apiErrors = (fetch_posts_response$, fetch_story_response$, save_post_response$) => ({
	fetch_posts$: xs.merge(requestErrors(fetch_posts_response$), requestErrors(fetch_story_response$)),
	save_post$: requestErrors(save_post_response$),
})

const requestErrors = response$ => xs.merge(
	response$.filter(res => !res.ok).map(res => [ res.error ]),
	response$.filter(res => res.ok).map(() => [])
)
.startWith([])

const view = (story$, posts$, new_post$, api_errors) => xs.combine(story$, posts$, new_post$, api_errors.fetch_posts$, api_errors.save_post$)
	.map(([ story, posts, new_post, fetch_errors, save_errors ]) => article('.content', [
		h1('.title', story.title),
		renderErrors(fetch_errors),
		div('.post-list', posts.map(renderPost)),
		renderErrors(save_errors),
		new_post,
	]))

const renderPost = ({ author, text, created_on, type }) => div('.post', { class: { meta: type === 'meta' }}, [
	div('.post-header', [
		div(img('.avatar', { props: { src: pinkie }})),
	]),
	div('.post-body', [
		div('.post-body-header', [
			span('.post-author', author),
			span('.post-date', created_on),
			type === 'meta' ? span('.post-tag', 'Meta') : null,
		]),
		div('.post-text', text.split('\n').map(x => p(x))),
	]),
])

export default Story
