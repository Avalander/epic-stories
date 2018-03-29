import 'scss/main.scss'

const token = new URL(window.location.href).searchParams.get('token')
const form = {
	username: document.querySelector('#username'),
	password: document.querySelector('#password'),
	repeat_password: document.querySelector('#repeat-password'),
	errors: document.querySelector('#errors'),
}

const validateUser = username => username && username.length > 0
const validatePassword = (password, repeat_password) =>
	password && password.length > 0 && password == repeat_password

document.querySelector('#register').onclick = event => {
	event.preventDefault()
	const username = form.username.value
	const password = form.password.value
	const repeat_password = form.repeat_password.value

	const errors = []
	if (!validateUser(username)) {
		errors.push('Please provide a username.')
	}
	if (!validatePassword(password, repeat_password)) {
		errors.push('Passwords don\'t match.')
	}

	if (errors.length > 0) {
		form.errors.innerHTML = errors
			.map(e => `<div class="alert-error">${e}</div>`)
			.join('')
		return
	}
	form.errors.innerHTML = ''

	fetch(`/api/register/${token}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ username, password }),
	})
		.then(res => res.ok ? res.json() : res.json().then(e => { throw e }))
		.then(result => window.location.href = '/welcome')
		.catch(error => form.errors.innerHTML = `<div class="alert-error">${error.message}</div>`)
}