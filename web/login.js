import 'scss/main.scss'

const form = {
	username: document.querySelector('#username'),
	password: document.querySelector('#password'),
	errors: document.querySelector('#errors'),
}

const isValid = value => value && value.length > 0

const parseQueryString = query_string => (query_string.startsWith('?')
	? query_string.substring(1).split('&')
		.map(x => x.split('='))
		.reduce((prev, x) => ({ ...prev, [x[0]]: x[1] || true }), {})
	: {})

document.querySelector('#login').onsubmit = event => {
	event.preventDefault()
	const username = form.username.value
	const password = form.password.value

	const errors = []
	if (!isValid(username)) {
		errors.push('Username is empty.')
	}
	if (!isValid(password)) {
		errors.push('Password is empty.')
	}

	if (errors.length > 0) {
		form.errors.innerHTML = errors
			.map(e => `<div class="alert-error">${e}</div>`)
			.join('')
		return
	}
	form.errors.innerHTML = ''

	fetch(`/api/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ username, password }),
	})
		.then(res => res.ok ? res.json() : res.json().then(e => { throw e }))
		.then(result => window.location.replace(parseQueryString(window.location.search).to || '/'))
		.catch(error => form.errors.innerHTML = `<div class="alert-error">${error.message}</div>`)
}