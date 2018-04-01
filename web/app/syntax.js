import {
	em,
	div,
	p,
	span,
	strong,
} from '@cycle/dom'


const type_parsers = {
	'span': x => span('', x),
	'strong': x => strong('', x),
	'em': x => em('', x),
}

export const textToVdom = text => {
	return text.split('\n')
		.filter(x => x.length > 0)
		.map(parseBold)
		.map(x => p(x))
}

const parseBold = text => generateSyntaxTree(text)
	.map(({ text, type }) => type_parsers[type](text))

const generateSyntaxTree = (text) => {
	if (text.length === 0) return []
	for (let i = 0; i < text.length; i++) {
		if (i === 0 || text[i - 1] === ' ') {
			const bold = scan('*', '*', text.substring(i))
			if (bold !== -1) {
				const end_i = bold + i
				return [
					...partialTree(text, 'strong', i, end_i),
					...generateSyntaxTree(text.substring(end_i + 1))
				]
			}
			const italic = scan('_', '_', text.substring(i))
			if (italic !== -1) {
				const end_i = italic + i
				return [
					...partialTree(text, 'em', i, end_i),
					...generateSyntaxTree(text.substring(end_i + 1))
				]
			}
		}
	}

	return [{
		text,
		type: 'span',
	}]
}

const partialTree = (text, type, start, end) => start === 0 ? [{
	text: text.substring(1, end), type
}] : [{
	text: text.substring(0, start), type: 'span'
}, {
	text: text.substring(start + 1, end), type
}]

const scan = (start_seq, end_seq, text) =>
	text.startsWith(start_seq) ? findEndSeq(1, end_seq, text) : -1

const findEndSeq = (start_index, end_seq, text) => {
	for (let i=start_index; i<text.length; i++) {
		if (text[i] === end_seq
			&& (i === (text.length - 1) || ' ,.;:¡!¿?-'.includes(text[i + 1]))
			&& (text[i - 1] !== ' ')) {
				return i
			}
	}
	return -1
}