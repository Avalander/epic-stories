import {
	div
} from '@cycle/dom'


export const renderErrors = errors =>
	div('.alert-container', errors.map(({ message }) => div('.alert-error', message)))