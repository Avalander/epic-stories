import {
	div,
	p,
	span,
	strong,
} from '@cycle/dom'


const bold_regex = /\*([\w|\.][^\n\*]*[\w|\.])\*/


const addIfNotEmpty = (arr, str, elem) => (str.length > 0 ? arr.push(elem(str)) : {})

const parseBold = text => {
	const result = []
	let rest = text
	let match = bold_regex.exec(rest)
	while (match !== null) {
		addIfNotEmpty(result, match.input.substring(0, match.index), span)
		addIfNotEmpty(result, match[1], strong)
		rest = match.input.substring(match.index + match[0].length)
		match = bold_regex.exec(rest)
	}
	addIfNotEmpty(result, rest, span)
	return result.length > 1 ? result : text
}

export const textToVdom = text => {
	return text.split('\n')
		.filter(x => x.length > 0)
		.map(parseBold)
		.map(x => p(x))
}