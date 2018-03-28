import test from 'tape'

import { assertHtmlLooksLike as htmlLooksLike } from 'test-utils'

import { textToVdom } from 'app/syntax'


test('textToVdom should break lines into paragraphs.', t => {
	const text = `This is paragraph one.
		This is paragraph two.`
	
	const actual = textToVdom(text)

	t.equal(actual.length, 2)
	htmlLooksLike(t, actual[0], '<p>This is paragraph one.</p>')
	htmlLooksLike(t, actual[1], '<p>This is paragraph two.</p>')

	t.end()
})

test('textToVdom should remove empty lines.', t => {
	const text = `This is paragraph one.

		This is paragraph two.`
	
	const actual = textToVdom(text)

	t.equal(actual.length, 2)
	htmlLooksLike(t, actual[0], '<p>This is paragraph one.</p>')
	htmlLooksLike(t, actual[1], '<p>This is paragraph two.</p>')

	t.end()
})

test('textToVdom should put text wrapped in * within strong tags.', t => {
	const text = 'This should be *bold* text.'

	const actual = textToVdom(text)

	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], '<p><span>This should be </span><strong>bold</strong><span> text.</span></p>')

	t.end()
})

test('textToVdom should not add an empty span at the beginning.', t => {
	const text = '*This* should be bold.'

	const actual = textToVdom(text)

	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], '<p><strong>This</strong><span> should be bold.</span></p>')

	t.end()
})

test('textToVdom should not add an empty span at the end.', t => {
	const text = 'This should be *bold.*'

	const actual = textToVdom(text)

	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], '<p><span>This should be </span><strong>bold.</strong></p>')

	t.end()
})

test('textToVdom should parse multiple bold items.', t => {
	const text = '*Bold* not bold *more bold* potato.'

	const actual = textToVdom(text)

	const expected = `<p>
		<strong>Bold</strong>
		<span> not bold </span>
		<strong>more bold</strong>
		<span> potato.</span>
	</p>`
	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], expected)

	t.end()
})
