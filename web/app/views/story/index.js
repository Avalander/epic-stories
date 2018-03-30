import './story.scss'

import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

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

import { textToVdom } from 'app/syntax'

import EditPost from './edit-post'
import { timestampToDate } from 'app/date'

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

	const open$ = DOM.select('[data-action="reply"]').events('click')
		.mapTo(true)
		.startWith(false)
	const edit_click$ = DOM.select('[data-action="edit"]').events('click')
		.map(ev => ev.target.tagName === 'BUTTON' ? ev.target : ev.target.parentElement)
		.map(target => target.dataset.post)
	const edit_post$ = edit_click$.compose(sampleCombine(fetch_posts.response$))
		.map(([ id, posts ]) => posts.find(x => x._id === id))

	const edit_post = EditPost({ DOM, open$, edit_post$, save_post })

	const posts$ = fetch_posts.response$
		.map(x => x.map(timestampToDate))
	const story$ = fetch_story.response$

	const save_post_request$ = save_post.makeRequest(edit_post.post$)
	
	return {
		DOM: view(story$, posts$, edit_post.DOM, user$, api_errors),
		HTTP: xs.merge(fetch_posts.request$, fetch_story.request$, save_post_request$),
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

const view = (story$, posts$, new_post$, user$, api_errors) => xs.combine(story$, posts$, new_post$, user$, api_errors.fetch_posts$)
	.map(([ story, posts, new_post, user, fetch_errors ]) => article('.content', [
		h1('.title', story.title),
		renderErrors(fetch_errors),
		div('.post-list', posts.map(x => renderPost(x, user))),
		div('.button-container.mt-10', [
			button('.btn.primary', { dataset: { action: 'reply' }}, 'Reply'),
		]),
		new_post,
	]))

const renderPost = ({ author, text, created_on, type, _id }, { username }) =>
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
				renderPostButtons({ author, username, text, type, _id }),
			]),
			//div('.post-text', text.split('\n').map(x => p(x))),
			div('.post-text', textToVdom(text)),
		]),
	])

const renderPostButtons = ({ author, username, text, type, _id }) => div('.button-container', [
	author === username ? button('.btn', {
		attrs: { title: 'Edit this post' },
		dataset: { action: 'edit', post: _id },
	}, [
		i('.fa.fa-pencil.mr-5'),
		span('.hide-sm', 'Edit'),
	]) : null,
])

export default Story
