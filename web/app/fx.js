import { error_codes } from 'Shared/result'


export const fetchJson = (url, success, failure, options, error) =>
	['fetchJson', {
		url,
		success,
		failure,
		options: {
			credentials: 'same-origin',
			...options,
		},
		error,
	}]

export const postJson = (url, success, failure, data, options, error) =>
	['fetchJson', {
		url,
		success,
		failure,
		options: {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
			},
			body: typeof data === 'string'
				? data
				: JSON.stringify(data),
			...options,
		},
		error,
	}]

export const go = url =>
	['go', {
		url,
	}]

export const makeFetchJson = () => (props, getAction) =>
	fetch(props.url, props.options)
		.then(res => res.json())
		.then(result =>
			!result.ok && result.error.code === error_codes.INVALID_CREDENTIALS
				? window.location.href = `/login.html?to=${window.location.pathname}`
				: result
		)
		.then(result =>
			result.ok
				? getAction(props.success) (result)
				: getAction(props.failure) (result)
		)
		.catch(error =>
			console.error(error)
		)

export const makeGo = () => props =>
	window.history.pushState(null, '', props.url)