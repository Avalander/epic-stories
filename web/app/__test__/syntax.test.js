import test from 'tape'

import { assertHtmlLooksLike as htmlLooksLike } from 'test-utils'

import { textToVdom } from 'app/syntax'


test('textToVdom should break lines into paragraphs.', t => {
	const text = `This is paragraph one.
		This is paragraph two.`
	
	const actual = textToVdom(text)

	t.equal(actual.length, 2)
	htmlLooksLike(t, actual[0], '<p><span>This is paragraph one.</span></p>')
	htmlLooksLike(t, actual[1], '<p><span>This is paragraph two.</span></p>')

	t.end()
})

test('textToVdom should remove empty lines.', t => {
	const text = `This is paragraph one.

		This is paragraph two.`
	
	const actual = textToVdom(text)

	t.equal(actual.length, 2)
	htmlLooksLike(t, actual[0], '<p><span>This is paragraph one.</span></p>')
	htmlLooksLike(t, actual[1], '<p><span>This is paragraph two.</span></p>')

	t.end()
})

test('textToVdom should put text wrapped in * within span.bold tags.', t => {
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

test('textToVdom should not consider * in different lines when parsing bold.', t => {
	const text = `This is *some
	serious* stuff`

	const actual = textToVdom(text)
	
	t.equal(actual.length, 2)
	htmlLooksLike(t, actual[0], '<p><span>This is *some</span></p>')
	htmlLooksLike(t, actual[1], '<p><span>serious* stuff</span></p>')

	t.end()
})

test('textToVdom should parse bold items separated with a period correctly.', t => {
	const text = '*Bold*. *Bold*'

	const actual = textToVdom(text)

	const expected = '<p><strong>Bold</strong><span>. </span><strong>Bold</strong></p>'
	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], expected)

	t.end()
})

test('textToVdom should put text wrapped in _ within span.italic tags.', t => {
	const text = '_Italics_ normal.'

	const actual = textToVdom(text)

	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], '<p><em>Italics</em><span> normal.</span></p>')

	t.end()
})

test('textToVdom should parse italics and bold.', t => {
	const text = 'Some _text_ is _italics and some_ text *is* _bold_. *Or* _bolder_'

	const actual = textToVdom(text)

	const expected = `<p>
		<span>Some </span>
		<em>text</em>
		<span> is </span>
		<em>italics and some</em>
		<span> text </span>
		<strong>is</strong>
		<span> </span>
		<em>bold</em>
		<span>. </span>
		<strong>Or</strong>
		<span> </span>
		<em>bolder</em>
	</p>`

	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], expected)

	t.end()
})
