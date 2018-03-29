import htmlLooksLike from 'html-looks-like'
import toHtml from 'snabbdom-to-html'


export const assertHtmlLooksLike = (t, actual, expected, message='Should be equivalent') => {
	try {
		htmlLooksLike(toHtml(actual), expected)
		t.pass(message)
	} catch (e) {
		t.fail(e.message)
	}
}