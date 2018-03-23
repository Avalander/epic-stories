import './story.scss'

import xs from 'xstream'

import {
	article,
	div,
	span,
	p,
	h1,
} from '@cycle/dom'

import NewPost from './new-post'


const mock_data = [{
	author: 'charles',
	text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu nulla tempus, efficitur metus sed, iaculis tellus. Pellentesque vehicula leo eget turpis dictum, sed convallis dui gravida. Vestibulum hendrerit lobortis sem, id varius urna placerat finibus. Nulla rhoncus vel leo vel porttitor. Nunc convallis eros eu elit vulputate aliquam. Phasellus sed gravida orci. Sed porta velit ac convallis tempus. Morbi convallis neque id consectetur finibus. Suspendisse eu lectus ut nibh volutpat accumsan. Sed quam neque, vestibulum nec tempor vitae, hendrerit vel turpis. Quisque sit amet hendrerit nulla. Ut vitae bibendum augue. Etiam lacus erat, dignissim sagittis sapien eget, bibendum malesuada neque. Nam ac nulla eget magna lobortis efficitur.\nNam at erat pellentesque, consequat diam at, volutpat erat. Pellentesque malesuada ante quis lacus imperdiet laoreet. Etiam aliquam, sem quis condimentum ornare, massa mi semper massa, non malesuada magna eros quis arcu. Mauris lobortis tempus lorem sit amet venenatis. Phasellus consectetur dignissim ante non gravida. In ultricies posuere pellentesque. Ut ultrices mi at diam gravida auctor id in libero. Curabitur lacinia arcu vel cursus consectetur. Curabitur blandit aliquam leo vel porta. Fusce erat ipsum, tempus in eros eget, mattis vehicula ex.',
	created_on: 1521820389350,
}, {
	author: 'jane',
	text: 'Donec non quam mollis, sollicitudin tortor non, fermentum metus. Quisque varius felis eget sapien posuere, quis imperdiet tellus gravida. Vivamus consequat non eros quis sagittis. Praesent interdum odio justo, at placerat lorem faucibus non. Fusce mattis convallis purus non maximus. Etiam sed dignissim odio. Nullam nisi nunc, ultricies ac ipsum malesuada, fringilla molestie purus. Phasellus feugiat urna non sem egestas laoreet.',
	created_on: 1521820389760,
}]

const Story = ({ DOM, HTTP, story_id$ }) => {
	const new_post = NewPost({ DOM })

	const fetch_posts_response$ = HTTP.select('fetch-posts').flatten()
		.map(res => res.body)
	const save_post_response$ = HTTP.select('save-post').flatten()
		.map(res => res.body)
	const save_post_success$ = save_post_response$
		.filter(res => res.ok)
		.map(res => res.result)

	const posts$ = fetch_posts_response$
		.filter(res => res.ok)
		.map(res => res.result)
		.map(x => x.map(timestampToDate))
		.startWith([])
	
	const story$ = xs.of({ title: 'Sagan om ringen' })

	const save_post_request$ = xs.combine(story_id$, new_post.new_post$)
		.map(([ story_id, text ]) => ({
			url: `/api/stories/${story_id}/posts`,
			method: 'POST',
			withCredentials: true,
			category: 'save-post',
			send: { text },
		}))

	const fetch_posts_request$ = xs.combine(story_id$, save_post_success$.startWith(true))
		.map(([ story_id ]) => ({
			url: `/api/stories/${story_id}/posts`,
			method: 'GET',
			withCredentials: true,
			category: 'fetch-posts',
		}))
	
	return {
		DOM: view(story$, posts$, new_post.DOM),
		HTTP: xs.merge(fetch_posts_request$, save_post_request$),
	}
}

const timestampToDate = post => {
	const date = new Date(post.created_on)
	return {
		...post,
		created_on: `${date.toDateString()} - ${date.toTimeString()}`
	}
}

const view = (story$, posts$, new_post$) => xs.combine(story$, posts$, new_post$)
	.map(([ story, posts, new_post ]) => article('.content', [
		h1('.title', story.title),
		div('.post-list', posts.map(renderPost)),
		new_post,
	]))

const renderPost = ({ author, text, created_on }) => div('.post', [
	div('.post-header', [
		div('.post-author', author),
		div('.post-date', created_on),
	]),
	div('.post-body', text.split('\n').map(x => p(x))),
])

export default Story
