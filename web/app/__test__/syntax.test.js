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

test('textToVdom should put text wrapped in * within span.bold tags.', t => {
	const text = 'This should be *bold* text.'

	const actual = textToVdom(text)

	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], '<p><span>This should be </span><span class="bold">bold</span><span> text.</span></p>')

	t.end()
})

test('textToVdom should not add an empty span at the beginning.', t => {
	const text = '*This* should be bold.'

	const actual = textToVdom(text)

	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], '<p><span class="bold">This</span><span> should be bold.</span></p>')

	t.end()
})

test('textToVdom should not add an empty span at the end.', t => {
	const text = 'This should be *bold.*'

	const actual = textToVdom(text)

	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], '<p><span>This should be </span><span class="bold">bold.</span></p>')

	t.end()
})

test('textToVdom should parse multiple bold items.', t => {
	const text = '*Bold* not bold *more bold* potato.'

	const actual = textToVdom(text)

	const expected = `<p>
		<span class="bold">Bold</span>
		<span> not bold </span>
		<span class="bold">more bold</span>
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
	htmlLooksLike(t, actual[0], '<p>This is *some</p>')
	htmlLooksLike(t, actual[1], '<p>serious* stuff</p>')

	t.end()
})

test('textToVdom should parse bold items separated with a period correctly.', t => {
	const text = '*Bold*. *Bold*'

	const actual = textToVdom(text)

	const expected = '<p><span class="bold">Bold</span><span>. </span><span class="bold">Bold</span></p>'
	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], expected)

	t.end()
})

test.skip('textToVdom should put text wrapped in _ within span.italic tags.', t => {
	const text = '_Italics_ normal.'

	const actual = textToVdom(text)

	t.equal(actual.length, 1)
	htmlLooksLike(t, actual[0], '<p><span class="italic">Italics</span><span> normal.</span></p>')

	t.end()
})
