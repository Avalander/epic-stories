import { article, div } from '@hyperapp/html'


export default messages =>
	article({ key: 'notifications', class: 'alert-container' },
		messages.map(({ message, type }) =>
			div({ class: `alert-${type}` }, message)
		)
	)
