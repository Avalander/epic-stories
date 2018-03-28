import test from 'tape'

import { assertHtmlLooksLike as htmlLooksLike } from 'test-utils'

import { renderErrors } from 'app/render'


test('renderErrors() should render an empty div when it receives an empty array', t => {
	t.plan(1)

	const actual = renderErrors([])

	const expected = `<div class="alert-container"></div>`
	htmlLooksLike(t, actual, expected)
})

test('renderErrors() should render a div with alerts when it receives an array of errors', t => {
	t.plan(1)

	const actual = renderErrors([{ message: 'Something went wrong.' }])

	const expected = `<div class="alert-container"><div class="alert-error">Something went wrong.</div></div>`
	htmlLooksLike(t, actual, expected)
})