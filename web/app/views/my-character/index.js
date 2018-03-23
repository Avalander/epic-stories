import xs from 'xstream'

import {
	div,
	h1,
	span,
	label,
	input,
	button,
	textarea,
} from '@cycle/dom'


const formGroup = (name, display_text) => div('.form-group', [
	label(display_text || name),
	input({ attrs: { name, id: name }}),
])
const view = id$ => id$.map(id =>
	div('.panel', [
		h1('My Character'),
		formGroup('name', 'Name'),
		formGroup('high_concept', 'High Concept'),
		formGroup('trouble', 'Trouble'),
		div('.form-group', [
			label('Description'),
			textarea({ attrs: { name: 'description', id: 'description' }})
		])
	])
)

const MyCharacter = ({ DOM, HTTP, id$ }) => ({
	DOM: view(id$),
})

export default MyCharacter
