import 'scss/main.scss'

const form = {
	username: document.querySelector('#username'),
	password: document.querySelector('#password'),
	errors: document.querySelector('#errors'),
}

const isValid = value => value && value.length > 0

document.querySelector('#register').onclick = event => {
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
		body: JSON.stringify({ username, password }),
	})
		.then(res => res.ok ? res.json() : res.json().then(e => { throw e }))
		.then(result => window.location.href = '/')
		.catch(error => form.errors.innerHTML = `<div class="alert-error">${error.message}</div>`)
}