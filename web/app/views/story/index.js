import './story.scss'

import xs from 'xstream'

import {
	article,
	div,
	span,
	p,
	h1,
	img,
	i,
	button,
} from '@cycle/dom'

import { renderErrors } from 'app/render'
import {
	makeFetch,
	makePost,
} from 'app/http'

import NewPost from './new-post'

import pinkie from 'app/pinkie.png'


const Story = ({ DOM, HTTP, IDB, story_id$ }) => {
	const user$ = IDB.store('user-cache').only('current_user').get()

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

	const new_post = NewPost({ DOM, clear$: save_post.response$ })

	const posts$ = fetch_posts.response$
		.map(x => x.map(timestampToDate))
	const story$ = fetch_story.response$

	const save_post_request$ = save_post.makeRequest(new_post.new_post$)
	
	return {
		DOM: view(story$, posts$, new_post.DOM, user$, api_errors),
		HTTP: xs.merge(fetch_posts.request$, fetch_story.request$, save_post_request$),
	}
}

const parseDate = date => `${date.toDateString()} - ${date.toTimeString()}`
	.replace(/GMT.*/g, '')
	.substring(0, 23)

const timestampToDate = post => ({
	...post,
	created_on: parseDate(new Date(post.created_on))
})

const apiErrors = (fetch_posts, fetch_story, save_post) => ({
	fetch_posts$: xs.merge(requestErrors(fetch_posts), requestErrors(fetch_story)),
	save_post$: requestErrors(save_post),
})

const requestErrors = ({ error$, response$ }) => xs.merge(
	error$.map(error => [ error ]),
	response$.map(() => [])
)
.startWith([])

const view = (story$, posts$, new_post$, user$, api_errors) => xs.combine(story$, posts$, new_post$, user$, api_errors.fetch_posts$, api_errors.save_post$)
	.map(([ story, posts, new_post, user, fetch_errors, save_errors ]) => article('.content', [
		h1('.title', story.title),
		renderErrors(fetch_errors),
		div('.post-list', posts.map(x => renderPost(x, user))),
		renderErrors(save_errors),
		new_post,
	]))

const renderPost = ({ author, text, created_on, type }, { username }) =>
	div('.post', { class: { meta: type === 'meta' }}, [
		div('.post-header', [
			div(img('.avatar', { props: { src: pinkie }})),
		]),
		div('.post-body', [
			div('.post-body-header', [
				div([
					span('.post-author.mr-20', author),
					span('.post-date.mr-20', created_on),
					type === 'meta' ? span('.post-tag', 'Meta') : null,
				]),
				div('.button-container', [
					author === username ? button('.btn', [
						i('.fa.fa-pencil.mr-5'),
						span('.hide-sm', 'Edit'),
					]) : null,
				]),
			]),
			div('.post-text', text.split('\n').map(x => p(x))),
		]),
	])

export default Story
