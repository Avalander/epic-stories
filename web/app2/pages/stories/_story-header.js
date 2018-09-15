import { header, h1, h2, div } from '@hyperapp/html'
import { Link } from '@hyperapp/router'


export default ({ _id, title, active, subtitle }) =>
	header({ class: 'story-header', key: 'story-header' }, [
		h1(title),
		subtitle
			? h2(subtitle)
			: null,
		div({ class: 'tab-container hide-sm' }, [
			HeaderLink('Chapters', `/stories/${_id}/chapters`, active === 'chapters'),
			HeaderLink('Characters', `/stories/${_id}/characters`, active === 'characters'),
			HeaderLink('My Character', `/stories/${_id}/my-character`, active === 'my-character'),
		])
	])

const HeaderLink = (title, to, is_active) =>
	Link({
		class: `header-link${is_active ? ' active' : ''}`,
		to: !is_active ? to : undefined,
	}, title)
