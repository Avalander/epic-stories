import {
	div,
	span,
	button,
	img,
	i,
	h4,
} from '@cycle/dom'

import { textToVdom } from 'app/syntax'

import pinkie from 'app/pinkie.png'


export default (post, user) => post.type === 'meta-group'
	? renderMetaGroup(post, user)
	: renderRegularPost(post, user)

const renderRegularPost = ({ author, text, created_on, type, _id }, { username }) =>
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
				renderPostButtons({ author, username, _id }),
			]),
			div('.post-text', textToVdom(text)),
		]),
	])

const renderMetaGroup = (group, user) =>
	div('.meta-group', [
		div('.meta-title', h4('Meta discussion')),
		...group.posts.map(renderMetaPost(user))
	])

const renderMetaPost = ({ username }) => ({ author, text, created_on, _id }) =>
	div('.post.meta', [
		div('.post-header', [
			div([
				span('.post-author', author),
			]),
		]),
		div('.post-body', [
			/*
			div('.post-body-header', [
				span('.post-date.mr-20', created_on),
				renderPostButtons({ author, username, _id })
			]),
			*/
			div('.post-text.text', textToVdom(text)),
		]),
	])

const renderPostButtons = ({ author, username, _id }) => div('.button-container', [
	author === username ? button('.btn', {
		attrs: { title: 'Edit this post' },
		dataset: { action: 'edit', post: _id },
	}, [
		i('.fa.fa-pencil.mr-5'),
		span('.hide-sm', 'Edit'),
	]) : null,
])
