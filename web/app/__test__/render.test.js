import test from 'tape'
import htmlLooksLike from 'html-looks-like'
import toHtml from 'snabbdom-to-html'

import { renderErrors } from 'app/render'


const assertHtmlLooksLike = (t, actual, expected, message='Should be equivalent') => {
	try {
		htmlLooksLike(toHtml(actual), expected)
		t.pass(message)
	} catch (e) {
		t.fail(e.message)
	}
}

test('renderErrors() should render an empty div when it receives an empty array', t => {
	t.plan(1)

	const actual = renderErrors([])

	const expected = `<div class="alert-container"></div>`
	assertHtmlLooksLike(t, actual, expected)
})

test('renderErrors() should render a div with alerts when it receives an array of errors', t => {
	t.plan(1)

	const actual = renderErrors([{ message: 'Something went wrong.' }])

	const expected = `<div class="alert-container"><div class="alert-error">Something went wrong.</div></div>`
	assertHtmlLooksLike(t, actual, expected)
})