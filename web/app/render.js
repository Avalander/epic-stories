import {
	div,
	label,
	input,
	span,
} from '@cycle/dom'


export const renderErrors = errors =>
	div('.alert-container', errors.map(({ message }) => div('.alert-error', message)))

export const renderFormGroup = (value, name, display_text, description) =>
	div('.form-group', [
		label(display_text || name),
		description ? span('.text-description', description) : null,
		input({ attrs: { name, id: name, value }}),
	])