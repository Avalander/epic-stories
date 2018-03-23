import './story.scss'

import xs from 'xstream'

import {
	article,
	div,
	span,
	p,
	h1,
} from '@cycle/dom'


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
	const data$ = xs.of(mock_data)
		.map(x => x.map(timestampToDate))
	
	const story$ = xs.of({ title: 'Sagan om ringen' })
	
	return {
		DOM: view(story$, data$)
	}
}

const timestampToDate = post => {
	const date = new Date(post.created_on)
	return {
		...post,
		created_on: `${date.toDateString()} - ${date.toTimeString()}`
	}
}

const view = (story$, posts$) => xs.combine(story$, posts$)
	.map(([ story, posts ]) => article('.content', [
		h1('.title', story.title),
		div('.post-list', posts.map(renderPost)),
	]))

const renderPost = ({ author, text, created_on }) => div('.post', [
	div('.post-header', [
		div('.post-author', author),
		div('.post-date', created_on),
	]),
	div('.post-body', text.split('\n').map(x => p(x))),
])

export default Story
